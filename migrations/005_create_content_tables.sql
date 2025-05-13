-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  summary TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  categories TEXT[],
  tags TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  layout TEXT DEFAULT 'default',
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  seo_title TEXT,
  seo_description TEXT,
  is_homepage BOOLEAN DEFAULT FALSE,
  parent_page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_sections table for modular page building
CREATE TABLE IF NOT EXISTS public.page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  content JSONB NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_revisions table for version history
CREATE TABLE IF NOT EXISTS public.content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  revision_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published blog posts
CREATE POLICY blog_posts_select_published ON public.blog_posts
  FOR SELECT USING (status = 'published');

-- Policy: Admins can read all blog posts
CREATE POLICY blog_posts_select_admin ON public.blog_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can insert blog posts
CREATE POLICY blog_posts_insert_admin ON public.blog_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can update blog posts
CREATE POLICY blog_posts_update_admin ON public.blog_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can delete blog posts
CREATE POLICY blog_posts_delete_admin ON public.blog_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Add RLS policies for pages
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published pages
CREATE POLICY pages_select_published ON public.pages
  FOR SELECT USING (status = 'published');

-- Policy: Admins can read all pages
CREATE POLICY pages_select_admin ON public.pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can insert pages
CREATE POLICY pages_insert_admin ON public.pages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can update pages
CREATE POLICY pages_update_admin ON public.pages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can delete pages
CREATE POLICY pages_delete_admin ON public.pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Add RLS policies for page_sections
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read page sections for published pages
CREATE POLICY page_sections_select_published ON public.page_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_sections.page_id AND pages.status = 'published'
    )
  );

-- Policy: Admins can read all page sections
CREATE POLICY page_sections_select_admin ON public.page_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can insert page sections
CREATE POLICY page_sections_insert_admin ON public.page_sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can update page sections
CREATE POLICY page_sections_update_admin ON public.page_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can delete page sections
CREATE POLICY page_sections_delete_admin ON public.page_sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Add RLS policies for content_revisions
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read content revisions
CREATE POLICY content_revisions_select_admin ON public.content_revisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: System can insert content revisions
CREATE POLICY content_revisions_insert_system ON public.content_revisions
  FOR INSERT WITH CHECK (true);

-- Add triggers to update the updated_at timestamp
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_sections_updated_at
BEFORE UPDATE ON public.page_sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to create content revisions on update
CREATE OR REPLACE FUNCTION create_content_revision()
RETURNS TRIGGER AS $$
DECLARE
  revision_count INTEGER;
  content_json TEXT;
BEGIN
  -- Get the current revision number
  SELECT COUNT(*) INTO revision_count
  FROM public.content_revisions
  WHERE content_type = TG_ARGV[0] AND content_id = OLD.id;
  
  -- Convert the old record to JSON
  content_json := row_to_json(OLD)::TEXT;
  
  -- Insert the revision
  INSERT INTO public.content_revisions (
    content_type,
    content_id,
    revision_number,
    content,
    metadata,
    created_by
  ) VALUES (
    TG_ARGV[0],
    OLD.id,
    revision_count + 1,
    content_json,
    jsonb_build_object('trigger', TG_OP),
    auth.uid()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to create content revisions
CREATE TRIGGER blog_posts_revision
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION create_content_revision('blog_post');

CREATE TRIGGER pages_revision
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION create_content_revision('page');

-- Add indexes for performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_status ON public.pages(status);
CREATE INDEX idx_pages_parent_page_id ON public.pages(parent_page_id);
CREATE INDEX idx_page_sections_page_id ON public.page_sections(page_id);
CREATE INDEX idx_content_revisions_content_id_type ON public.content_revisions(content_id, content_type);
