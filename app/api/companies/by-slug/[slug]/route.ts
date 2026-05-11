/**
 * Company API Route (by slug) - PUBLIC
 * GET /api/companies/by-slug/[slug] - Get company by slug (public access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyBySlug } from '@/lib/services/companyService';

/**
 * GET /api/companies/by-slug/[slug]
 * Get company by slug (public access for test portal)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get company (only active companies)
    const company = await getCompanyBySlug(slug);

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found or inactive' },
        { status: 404 }
      );
    }

    // Return only public fields
    const publicCompany = {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logo_url: company.logo_url,
      primary_color: company.primary_color,
      secondary_color: company.secondary_color,
      font_family: company.font_family,
      custom_welcome_message: company.custom_welcome_message,
      background_image_url: company.background_image_url,
      active: company.active,
    };

    return NextResponse.json(publicCompany);
  } catch (error) {
    console.error('Error fetching company by slug:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch company' },
      { status: 500 }
    );
  }
}
