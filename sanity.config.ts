'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { table } from '@sanity/table'
import { schemaTypes } from './sanity/schemas'
import { apiVersion, dataset, projectId } from './sanity/env'

export default defineConfig({
  name: 'rosecrest',
  title: 'Rosecrest Blog',
  projectId: projectId || 'unused',
  dataset,
  basePath: '/studio',
  plugins: [structureTool(), table(), visionTool({ defaultApiVersion: apiVersion })],
  schema: {
    types: schemaTypes,
  },
})
