import { pgTable, text, numeric, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

export const rows = pgTable('rows', {
  id: integer('id').primaryKey(),
  colText1: text('col_text_1'),
  colText2: text('col_text_2'),
  colNumber1: numeric('col_number_1'),
  colNumber2: numeric('col_number_2'),
  colSelect1: varchar('col_select_1', { length: 100 }),
  colSelect2: varchar('col_select_2', { length: 100 }),
  colText3: text('col_text_3'),
  colText4: text('col_text_4'),
  colNumber3: numeric('col_number_3'),
  colText5: text('col_text_5'),
  colNumber4: numeric('col_number_4'),
  colSelect3: varchar('col_select_3', { length: 100 }),
  colText6: text('col_text_6'),
  colText7: text('col_text_7'),
  colNumber5: numeric('col_number_5'),
  colText8: text('col_text_8'),
  colSelect4: varchar('col_select_4', { length: 100 }),
  colText9: text('col_text_9'),
  colNumber6: numeric('col_number_6'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Row = typeof rows.$inferSelect;
export type NewRow = typeof rows.$inferInsert;
