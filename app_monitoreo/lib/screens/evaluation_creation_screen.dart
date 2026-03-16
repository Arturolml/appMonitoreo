import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/evaluation_service.dart';

class EvaluationCreationScreen extends StatefulWidget {
  final String patientId;

  const EvaluationCreationScreen({super.key, required this.patientId});

  @override
  State<EvaluationCreationScreen> createState() => _EvaluationCreationScreenState();
}

class _EvaluationCreationScreenState extends State<EvaluationCreationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _evaluationService = EvaluationService();

  final _diagnosticoController = TextEditingController();
  final _observacionesController = TextEditingController();
  final _indicacionesController = TextEditingController();
  final _medicamentosController = TextEditingController();

  bool _isLoading = false;
  Map<String, int> _barthelScores = {};
  Map<String, int> _tinettiScores = {};
  Map<String, int> _nortonScores = {};
  Map<String, int> _pfeifferErrors = {};
  double _nivelDolor = 0;
  Map<String, int> _lawtonScores = {};
  Map<String, int> _mnaScores = {};

  void _updateScoreLabels() {
    int sum(Map<String, int> m) => m.values.fold(0, (a, b) => a + b);
    
    String text = _observacionesController.text;
    
    void updateTag(String label, int current, int max) {
      String tag = '$label:';
      if (text.contains(tag)) {
        text = text.replaceAll(RegExp(r'' + label + r': \d+/\d+'), '$tag $current/$max');
      } else {
        text = '$text\n$tag $current/$max'.trim();
      }
    }

    if (_barthelScores.isNotEmpty) updateTag('BARTHEL', sum(_barthelScores), 100);
    if (_tinettiScores.isNotEmpty) updateTag('TINETTI', sum(_tinettiScores), 28);
    if (_nortonScores.isNotEmpty) updateTag('NORTON', sum(_nortonScores), 20);
    if (_pfeifferErrors.isNotEmpty) updateTag('PFEIFFER_ERRORES', sum(_pfeifferErrors), 10);
    if (_lawtonScores.isNotEmpty) updateTag('LAWTON', sum(_lawtonScores), 8);
    if (_mnaScores.isNotEmpty) updateTag('MNA', sum(_mnaScores), 14);
    
    _observacionesController.text = text;
  }

  Future<void> _saveEvaluation() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    try {
      int sum(Map<String, int> m) => m.values.fold(0, (a, b) => a + b);

      await _evaluationService.createEvaluation(
        token: authProvider.token!,
        pacienteId: widget.patientId,
        diagnostico: _diagnosticoController.text.trim(),
        observaciones: _observacionesController.text.trim(),
        indicaciones: _indicacionesController.text.trim(),
        medicamentos: _medicamentosController.text.trim(),
        puntajeBarthel: _barthelScores.isNotEmpty ? sum(_barthelScores) : null,
        puntajeTinetti: _tinettiScores.isNotEmpty ? sum(_tinettiScores) : null,
        puntajeNorton: _nortonScores.isNotEmpty ? sum(_nortonScores) : null,
        puntajePfeiffer: _pfeifferErrors.isNotEmpty ? sum(_pfeifferErrors) : null,
        nivelDolor: _nivelDolor.toInt(),
        puntajeLawton: _lawtonScores.isNotEmpty ? sum(_lawtonScores) : null,
        puntajeMNA: _mnaScores.isNotEmpty ? sum(_mnaScores) : null,
        datosEscalas: {
          'barthel': _barthelScores,
          'tinetti': _tinettiScores,
          'norton': _nortonScores,
          'pfeiffer': _pfeifferErrors,
          'dolor': _nivelDolor.toInt(),
          'lawton': _lawtonScores,
          'mna': _mnaScores,
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Valoración Integral Guardada')));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Valoración Geriátrica Integral')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildPainSection(),
                  const SizedBox(height: 24),
                  _buildPfeifferSection(),
                  const SizedBox(height: 24),
                  _buildGenericScale('Escala de Norton (Riesgo Úlceras)', _nortonScores, NORTON_QUESTIONS, 20, 'NORTON'),
                  const SizedBox(height: 24),
                  _buildGenericScale('MNA (Estado Nutricional)', _mnaScores, MNA_QUESTIONS, 14, 'MNA'),
                  const SizedBox(height: 24),
                  _buildGenericScale('Índice de Barthel (AVD Básicas)', _barthelScores, BARTHEL_QUESTIONS, 100, 'BARTHEL'),
                  const SizedBox(height: 24),
                  _buildGenericScale('Lawton & Brody (Instrumentales)', _lawtonScores, LAWTON_QUESTIONS, 8, 'LAWTON'),
                  const SizedBox(height: 24),
                  _buildGenericScale('Escala de Tinetti (Marcha / Eq)', _tinettiScores, TINETTI_QUESTIONS, 28, 'TINETTI'),
                  
                  const SizedBox(height: 32),
                  const Divider(thickness: 2),
                  const SizedBox(height: 24),
                  Text('Finalizar Evaluación', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blueGrey[900])),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _diagnosticoController,
                    decoration: const InputDecoration(labelText: 'Diagnóstico Principal*', border: OutlineInputBorder()),
                    validator: (v) => v!.isEmpty ? 'Requerido' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _observacionesController,
                    maxLines: 5,
                    decoration: const InputDecoration(labelText: 'Resultados y Observaciones', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 55,
                    child: ElevatedButton(
                      onPressed: _saveEvaluation,
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[900], foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      child: const Text('REGISTRAR VALORACIÓN VGI', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ),
                  const SizedBox(height: 50),
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildPainSection() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15), side: BorderSide(color: Colors.red.withOpacity(0.3))),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Nivel de Dolor (EVA)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(20)),
                  child: Text('${_nivelDolor.toInt()}/10', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Slider(
              value: _nivelDolor,
              min: 0, max: 10, divisions: 10,
              activeColor: Colors.red,
              inactiveColor: Colors.red.withOpacity(0.1),
              onChanged: (v) => setState(() => _nivelDolor = v),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('Sin dolor', style: TextStyle(fontSize: 10, color: Colors.grey)),
                Text('Máximo dolor', style: TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildPfeifferSection() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('🧠 Test de Pfeiffer (Cognitivo)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Marque las respuestas INCORRECTAS (Errores)', style: TextStyle(fontSize: 12, color: Colors.red, fontWeight: FontWeight.w500)),
            const Divider(),
            ...PFEIFFER_QUESTIONS.entries.map((e) => CheckboxListTile(
              title: Text(e.value, style: const TextStyle(fontSize: 13)),
              value: _pfeifferErrors[e.key] == 1,
              visualDensity: VisualDensity.compact,
              onChanged: (v) {
                setState(() => _pfeifferErrors[e.key] = v! ? 1 : 0);
                _updateScoreLabels();
              },
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildGenericScale(String title, Map<String, int> scoreMap, Map<String, dynamic> questions, int max, String label) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
                Text('${scoreMap.values.fold(0, (a, b) => a + b)}/$max', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
              ],
            ),
            const Divider(),
            ...questions.entries.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: DropdownButtonFormField<int>(
                isExpanded: true,
                decoration: InputDecoration(labelText: e.value['label'], labelStyle: const TextStyle(fontSize: 12)),
                items: (e.value['options'] as List).map((opt) => DropdownMenuItem<int>(
                  value: opt['val'],
                  child: Text('${opt['text']} (${opt['val']})', style: const TextStyle(fontSize: 13)),
                )).toList(),
                onChanged: (v) {
                  setState(() => scoreMap[e.key] = v!);
                  _updateScoreLabels();
                },
              ),
            )),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _diagnosticoController.dispose();
    _observacionesController.dispose();
    _indicacionesController.dispose();
    _medicamentosController.dispose();
    super.dispose();
  }
}

const PFEIFFER_QUESTIONS = {
  'fecha': '¿Qué día es hoy? (Fecha completa)',
  'dia_semana': '¿Qué día de la semana es?',
  'lugar': '¿Dónde estamos ahora?',
  'telefono': '¿Cuál es su número de teléfono?',
  'edad': '¿Qué edad tiene?',
  'nacimiento': '¿Cuándo nació?',
  'presidente': '¿Quién es el presidente actual?',
  'presidente_ant': '¿Quién fue el presidente anterior?',
  'apellido_madre': '¿Cuál era el apellido de su madre?',
  'resta': 'Resta de 3 en 3 desde 20'
};

const NORTON_QUESTIONS = {
  'estado_fisico': {'label': 'Estado Físico', 'options': [{'val': 1, 'text': 'Muy malo'}, {'val': 2, 'text': 'Pobre'}, {'val': 3, 'text': 'Mediano'}, {'val': 4, 'text': 'Bueno'}]},
  'estado_mental': {'label': 'Estado Mental', 'options': [{'val': 1, 'text': 'Estuporoso'}, {'val': 2, 'text': 'Confuso'}, {'val': 3, 'text': 'Apático'}, {'val': 4, 'text': 'Alerta'}]},
  'actividad': {'label': 'Actividad', 'options': [{'val': 1, 'text': 'Encamado'}, {'val': 2, 'text': 'Silla de ruedas'}, {'val': 3, 'text': 'Camina con ayuda'}, {'val': 4, 'text': 'Ambulante'}]},
  'movilidad': {'label': 'Movilidad', 'options': [{'val': 1, 'text': 'Inmóvil'}, {'val': 2, 'text': 'Muy limitada'}, {'val': 3, 'text': 'Limitada'}, {'val': 4, 'text': 'Total'}]},
  'incontinencia': {'label': 'Incontinencia', 'options': [{'val': 1, 'text': 'Urinaria y Fecal'}, {'val': 2, 'text': 'Urinaria o Fecal'}, {'val': 3, 'text': 'Ocasional'}, {'val': 4, 'text': 'Ninguna'}]},
};

const MNA_QUESTIONS = {
  'ingesta': {'label': 'Ingesta de alimentos', 'options': [{'val': 0, 'text': 'Grave disminución'}, {'val': 1, 'text': 'Moderada'}, {'val': 2, 'text': 'Sin disminución'}]},
  'peso': {'label': 'Pérdida de peso', 'options': [{'val': 0, 'text': '>3kg'}, {'val': 1, 'text': 'No sabe'}, {'val': 2, 'text': '1-3kg'}, {'val': 3, 'text': 'No hubo'}]},
  'movilidad': {'label': 'Movilidad', 'options': [{'val': 0, 'text': 'Cama/Silla'}, {'val': 1, 'text': 'Camina en casa'}, {'val': 2, 'text': 'Sale al exterior'}]},
  'estres': {'label': 'Estrés psicológico', 'options': [{'val': 0, 'text': 'Sí'}, {'val': 2, 'text': 'No'}]},
};

const LAWTON_QUESTIONS = {
  'telefono': {'label': 'Uso del Teléfono', 'options': [{'val': 0, 'text': 'No usa'}, {'val': 1, 'text': 'Iniciativa propia'}]},
  'compras': {'label': 'Compras', 'options': [{'val': 0, 'text': 'Necesita ayuda'}, {'val': 1, 'text': 'Independiente'}]},
  'comida': {'label': 'Preparación de comida', 'options': [{'val': 0, 'text': 'Necesita que lo sirvan'}, {'val': 1, 'text': 'Organiza/Prepara'}]},
  'casa': {'label': 'Cuidado de la casa', 'options': [{'val': 0, 'text': 'No participa'}, {'val': 1, 'text': 'Tareas ligeras'}]},
};

const BARTHEL_QUESTIONS = {
  'comida': {'label': 'Comida', 'options': [{'val': 0, 'text': 'Dependiente'}, {'val': 5, 'text': 'Necesita ayuda'}, {'val': 10, 'text': 'Independiente'}]},
  'lavado': {'label': 'Lavado', 'options': [{'val': 0, 'text': 'Dependiente'}, {'val': 5, 'text': 'Independiente'}]},
  'vestido': {'label': 'Vestido', 'options': [{'val': 0, 'text': 'Dependiente'}, {'val': 5, 'text': 'Necesita ayuda'}, {'val': 10, 'text': 'Independiente'}]},
  'aseo': {'label': 'Aseo Personal', 'options': [{'val': 0, 'text': 'Dependiente'}, {'val': 5, 'text': 'Independiente'}]},
  'deposicion': {'label': 'Deposición', 'options': [{'val': 0, 'text': 'Incontinente'}, {'val': 5, 'text': 'Accidente ocasional'}, {'val': 10, 'text': 'Continente'}]},
  'miccion': {'label': 'Micción', 'options': [{'val': 0, 'text': 'Incontinente'}, {'val': 5, 'text': 'Accidente ocasional'}, {'val': 10, 'text': 'Continente'}]},
  'retrete': {'label': 'Uso del Retrete', 'options': [{'val': 0, 'text': 'Dependiente'}, {'val': 5, 'text': 'Necesita ayuda'}, {'val': 10, 'text': 'Independiente'}]},
  'traslado': {'label': 'Traslado (Cama-Silla)', 'options': [{'val': 0, 'text': 'Dependiente'}, {'val': 10, 'text': 'Gran ayuda'}, {'val': 15, 'text': 'Independiente'}]},
  'deambulacion': {'label': 'Deambulación', 'options': [{'val': 0, 'text': 'Inmóvil'}, {'val': 10, 'text': 'Independiente con silla'}, {'val': 15, 'text': 'Independiente'}]},
  'escaleras': {'label': 'Escaleras', 'options': [{'val': 0, 'text': 'Dependiente'}, {'val': 5, 'text': 'Necesita ayuda'}, {'val': 10, 'text': 'Independiente'}]},
};

const TINETTI_QUESTIONS = {
  'equilibrio': {'label': 'Equilibrio (Sentado)', 'options': [{'val': 0, 'text': 'Se inclina'}, {'val': 1, 'text': 'Seguro'}]},
  'levantarse': {'label': 'Levantarse', 'options': [{'val': 0, 'text': 'Incapaz'}, {'val': 1, 'text': 'Capaz con ayuda'}, {'val': 2, 'text': 'Capaz sin ayuda'}]},
  'sentarse': {'label': 'Sentarse', 'options': [{'val': 0, 'text': 'Inseguro'}, {'val': 1, 'text': 'Usa brazos'}, {'val': 2, 'text': 'Seguro'}]},
  'giro': {'label': 'Giro 360 grados', 'options': [{'val': 0, 'text': 'Pasos discontinuos'}, {'val': 1, 'text': 'Continuo'}, {'val': 2, 'text': 'Seguro'}]},
  'inicio_marcha': {'label': 'Inicio de la marcha', 'options': [{'val': 0, 'text': 'Duda'}, {'val': 1, 'text': 'Sin duda'}]},
  'longitud': {'label': 'Longitud del paso', 'options': [{'val': 0, 'text': 'Corto'}, {'val': 1, 'text': 'Normal'}]},
  'trayectoria': {'label': 'Trayectoria', 'options': [{'val': 0, 'text': 'Desviación'}, {'val': 1, 'text': 'Recto'}]},
};
