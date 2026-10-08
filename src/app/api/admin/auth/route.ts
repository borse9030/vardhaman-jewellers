import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = process.env.ADMIN_EMAIL || 'jaynam27@gmail.com';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'JaYnAm@147';

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    if (email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword) {
      // Secure server-side validation succeeded
      const user = {
        uid: 'super-admin-01',
        email: expectedEmail,
        name: 'Jaynam (Super Admin)',
        role: 'super_admin',
        isActive: true,
      };

      return NextResponse.json({
        success: true,
        user,
        token: `vj_adm_tok_${Date.now()}_${Buffer.from(expectedEmail).toString('base64')}`,
      });
    }

    // Secondary staff mock accounts if tested
    if (email.toLowerCase().includes('catalog') && password === 'Catalog@123') {
      return NextResponse.json({
        success: true,
        user: {
          uid: 'catalog-mgr-01',
          email,
          name: 'Catalog Manager',
          role: 'catalog_manager',
          isActive: true,
        },
        token: `vj_adm_tok_${Date.now()}_catalog`,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials. Access denied.' }, { status: 401 });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
