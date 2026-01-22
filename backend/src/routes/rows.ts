import { FastifyInstance } from 'fastify';
import { eq, count, asc } from 'drizzle-orm';
import { db } from '../db';
import { rows } from '../schema';
import { notifyRowUpdate } from '../realtime';

export async function rowsRoutes(server: FastifyInstance) {
  // Get rows with pagination
  server.get<{
    Querystring: { page?: string; pageSize?: string };
  }>('/rows', async (request, reply) => {
    const page = parseInt(request.query.page || '0', 10);
    const pageSize = Math.min(parseInt(request.query.pageSize || '100', 10), 1000);
    const offset = page * pageSize;

    const [allRows, totalResult] = await Promise.all([
      db.select().from(rows).limit(pageSize).offset(offset).orderBy(asc(rows.id)),
      db.select({ count: count() }).from(rows),
    ]);

    // Transform to match frontend expectations (snake_case keys)
    const transformedRows = allRows.map((row) => ({
      id: row.id != null ? Number(row.id) : null,
      col_text_1: row.colText1,
      col_text_2: row.colText2,
      col_number_1: row.colNumber1 ? parseFloat(row.colNumber1) : null,
      col_number_2: row.colNumber2 ? parseFloat(row.colNumber2) : null,
      col_select_1: row.colSelect1,
      col_select_2: row.colSelect2,
      col_text_3: row.colText3,
      col_text_4: row.colText4,
      col_number_3: row.colNumber3 ? parseFloat(row.colNumber3) : null,
      col_text_5: row.colText5,
      col_number_4: row.colNumber4 ? parseFloat(row.colNumber4) : null,
      col_select_3: row.colSelect3,
      col_text_6: row.colText6,
      col_text_7: row.colText7,
      col_number_5: row.colNumber5 ? parseFloat(row.colNumber5) : null,
      col_text_8: row.colText8,
      col_select_4: row.colSelect4,
      col_text_9: row.colText9,
      col_number_6: row.colNumber6 ? parseFloat(row.colNumber6) : null,
    }));

    return {
      rows: transformedRows,
      total: Number(totalResult[0]?.count ?? 0),
      page,
      pageSize,
    };
  });

  // Update a row
  server.patch<{
    Params: { id: string };
    Body: { updates: Record<string, string | number | null> };
  }>('/rows/:id', async (request, reply) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return reply.code(400).send({ error: 'Invalid ID' });
    }
    const { updates } = request.body;

    // Transform snake_case to camelCase for database
    const dbUpdates: any = {};
    if (updates.col_text_1 !== undefined) dbUpdates.colText1 = updates.col_text_1;
    if (updates.col_text_2 !== undefined) dbUpdates.colText2 = updates.col_text_2;
    if (updates.col_number_1 !== undefined) dbUpdates.colNumber1 = updates.col_number_1?.toString() || null;
    if (updates.col_number_2 !== undefined) dbUpdates.colNumber2 = updates.col_number_2?.toString() || null;
    if (updates.col_select_1 !== undefined) dbUpdates.colSelect1 = updates.col_select_1;
    if (updates.col_select_2 !== undefined) dbUpdates.colSelect2 = updates.col_select_2;
    if (updates.col_text_3 !== undefined) dbUpdates.colText3 = updates.col_text_3;
    if (updates.col_text_4 !== undefined) dbUpdates.colText4 = updates.col_text_4;
    if (updates.col_number_3 !== undefined) dbUpdates.colNumber3 = updates.col_number_3?.toString() || null;
    if (updates.col_text_5 !== undefined) dbUpdates.colText5 = updates.col_text_5;
    if (updates.col_number_4 !== undefined) dbUpdates.colNumber4 = updates.col_number_4?.toString() || null;
    if (updates.col_select_3 !== undefined) dbUpdates.colSelect3 = updates.col_select_3;
    if (updates.col_text_6 !== undefined) dbUpdates.colText6 = updates.col_text_6;
    if (updates.col_text_7 !== undefined) dbUpdates.colText7 = updates.col_text_7;
    if (updates.col_number_5 !== undefined) dbUpdates.colNumber5 = updates.col_number_5?.toString() || null;
    if (updates.col_text_8 !== undefined) dbUpdates.colText8 = updates.col_text_8;
    if (updates.col_select_4 !== undefined) dbUpdates.colSelect4 = updates.col_select_4;
    if (updates.col_text_9 !== undefined) dbUpdates.colText9 = updates.col_text_9;
    if (updates.col_number_6 !== undefined) dbUpdates.colNumber6 = updates.col_number_6?.toString() || null;

    dbUpdates.updatedAt = new Date();

    const [updatedRow] = await db
      .update(rows)
      .set(dbUpdates)
      .where(eq(rows.id, id))
      .returning();

    if (!updatedRow) {
      return reply.code(404).send({ error: 'Row not found' });
    }

    // Transform back to snake_case for frontend
    const transformedRow = {
      id: updatedRow.id != null ? Number(updatedRow.id) : null,
      col_text_1: updatedRow.colText1,
      col_text_2: updatedRow.colText2,
      col_number_1: updatedRow.colNumber1 ? parseFloat(updatedRow.colNumber1) : null,
      col_number_2: updatedRow.colNumber2 ? parseFloat(updatedRow.colNumber2) : null,
      col_select_1: updatedRow.colSelect1,
      col_select_2: updatedRow.colSelect2,
      col_text_3: updatedRow.colText3,
      col_text_4: updatedRow.colText4,
      col_number_3: updatedRow.colNumber3 ? parseFloat(updatedRow.colNumber3) : null,
      col_text_5: updatedRow.colText5,
      col_number_4: updatedRow.colNumber4 ? parseFloat(updatedRow.colNumber4) : null,
      col_select_3: updatedRow.colSelect3,
      col_text_6: updatedRow.colText6,
      col_text_7: updatedRow.colText7,
      col_number_5: updatedRow.colNumber5 ? parseFloat(updatedRow.colNumber5) : null,
      col_text_8: updatedRow.colText8,
      col_select_4: updatedRow.colSelect4,
      col_text_9: updatedRow.colText9,
      col_number_6: updatedRow.colNumber6 ? parseFloat(updatedRow.colNumber6) : null,
    };

    // Notify all clients via Postgres NOTIFY
    notifyRowUpdate(transformedRow);

    return transformedRow;
  });
}
