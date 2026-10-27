import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
    }),
    defineField({
      name: 'jobTitle',
      title: 'Job title',
      type: 'string',
      description: 'Shown under the post title, e.g. "Chartered Building Surveyor".',
    }),
    defineField({
      name: 'credentials',
      title: 'Credentials',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Post-nominals or qualifications, e.g. MRICS, AssocRICS.',
    }),
    defineField({
      name: 'profileLinks',
      title: 'Profile links',
      type: 'array',
      of: [{ type: 'url' }],
      description:
        'Public profiles of this person, such as their RICS directory entry and LinkedIn. Search engines and AI assistants use these to confirm who wrote the post.',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'name', media: 'avatar' },
  },
})
