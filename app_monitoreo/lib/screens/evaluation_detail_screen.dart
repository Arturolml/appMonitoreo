import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class EvaluationDetailScreen extends StatelessWidget {
  final Map<String, dynamic> evaluation;

  const EvaluationDetailScreen({super.key, required this.evaluation});

  @override
  Widget build(BuildContext context) {
    final date = DateTime.parse(evaluation['fechaCreacion']);
    final formattedDate = DateFormat('dd/MM/yyyy HH:mm').format(date);
    final scales = evaluation['datosEscalas'] as Map<String, dynamic>? ?? {};

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de Valoración'),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildMainInfo(formattedDate),
            const SizedBox(height: 24),
            _buildDiagnosisSection(),
            const SizedBox(height: 24),
            _buildAISection(),
            const SizedBox(height: 24),
            _buildScalesGrid(scales),
          ],
        ),
      ),
    );
  }

  Widget _buildMainInfo(String date) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
      ),
      child: Row(
        children: [
          const Icon(Icons.assignment_ind, size: 40, color: Colors.blueAccent),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Evaluador: ${evaluation['nombreEvaluador']}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              Text(
                'Fecha: $date',
                style: const TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDiagnosisSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('DIAGNÓSTICO Y OBSERVACIONES', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.blueGrey)),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.blueAccent.withOpacity(0.05), borderRadius: BorderRadius.circular(12)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(evaluation['diagnostico'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const Divider(),
              Text(evaluation['observaciones'] ?? 'Sin observaciones.', style: const TextStyle(fontSize: 14)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAISection() {
    if (evaluation['nivelEstres'] == null && evaluation['nivelAnsiedad'] == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
          const Text('ANÁLISIS DE INTELIGENCIA ARTIFICIAL', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.indigo)),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildAIScoreCard('Estrés', evaluation['nivelEstres'], Colors.indigo),
              const SizedBox(width: 12),
              _buildAIScoreCard('Ansiedad', evaluation['nivelAnsiedad'], Colors.purple),
            ],
          ),
      ],
    );
  }

  Widget _buildAIScoreCard(String label, dynamic score, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
            Text(
              score != null ? '${score.toStringAsFixed(1)}%' : 'N/A',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScalesGrid(Map<String, dynamic> scales) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('RESULTADOS DE ESCALAS CLÍNICAS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.blueGrey)),
        const SizedBox(height: 8),
        _buildScaleTile('🏠 Barthel (Independencia)', evaluation['puntajeBarthel'], 100, Colors.blue),
        _buildScaleTile('🚶 Tinetti (Marcha/Eq)', evaluation['puntajeTinetti'], 28, Colors.green),
        _buildScaleTile('🛡️ Norton (Piel)', evaluation['puntajeNorton'], 20, Colors.orange),
        _buildScaleTile('🧠 Pfeiffer (Cognitivo)', evaluation['puntajePfeiffer'], 10, Colors.red, isErrors: true),
        _buildScaleTile('🩹 EVA (Dolor)', evaluation['nivelDolor'], 10, Colors.redAccent),
        _buildScaleTile('📡 Lawton (Social)', evaluation['puntajeLawton'], 8, Colors.teal),
        _buildScaleTile('🍎 MNA (Nutrición)', evaluation['puntajeMNA'], 14, Colors.brown),
      ],
    );
  }

  Widget _buildScaleTile(String title, dynamic score, int max, Color color, {bool isErrors = false}) {
    if (score == null) return const SizedBox.shrink();
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(20)),
          child: Text(
            isErrors ? '$score Errores' : '$score/$max',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
