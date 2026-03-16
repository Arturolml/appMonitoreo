import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Check if admin user already exists
    const existingAdmin = await prisma.usuario.findUnique({
        where: { email: 'admin@admin.com' },
    });

    if (!existingAdmin) {
        // We assume there will be a password hashing mechanism like bcrypt used in the auth service
        // For the seed, let's create a generic hash for 'admin123' if bcrypt is available
        // Note: If you don't use bcrypt, change this line to your project's hashing logic
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltOrRounds);

        await prisma.usuario.create({
            data: {
                email: 'admin@admin.com',
                password: hashedPassword, // The hashed version of 'admin123'
                nombre: 'Admin',
                apellidoPaterno: 'Sistema',
                rol: 'ADMIN',
            },
        });

        console.log('✅ Usuario Administrador Creado: admin@admin.com / admin123');
    } else {
        console.log('ℹ️ El usuario administrador ya existe. Omitiendo creación.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
