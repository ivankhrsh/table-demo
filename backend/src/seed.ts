import { db } from './db';
import { rows } from './schema';

const selectOptions1 = ['Option A', 'Option B', 'Option C', 'Option D'];
const selectOptions2 = ['Red', 'Green', 'Blue', 'Yellow'];
const selectOptions3 = ['Small', 'Medium', 'Large', 'XL'];
const selectOptions4 = ['Active', 'Inactive', 'Pending'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomText(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function seed() {
  console.log('Seeding database...');
  
  const totalRows = 50000;
  const batchSize = 1000;

  for (let i = 0; i < totalRows; i += batchSize) {
    const batch = Array.from({ length: Math.min(batchSize, totalRows - i) }, (_, idx) => ({
      id: i + idx + 1,
      colText1: `Text ${i + idx + 1}-1`,
      colText2: randomText(15),
      colNumber1: (Math.random() * 1000).toFixed(2),
      colNumber2: (Math.random() * 10000).toFixed(2),
      colSelect1: randomChoice(selectOptions1),
      colSelect2: randomChoice(selectOptions2),
      colText3: randomText(20),
      colText4: `Data ${i + idx + 1}`,
      colNumber3: (Math.random() * 500).toFixed(2),
      colText5: randomText(12),
      colNumber4: (Math.random() * 2000).toFixed(2),
      colSelect3: randomChoice(selectOptions3),
      colText6: randomText(18),
      colText7: `Item ${i + idx + 1}`,
      colNumber5: (Math.random() * 3000).toFixed(2),
      colText8: randomText(14),
      colSelect4: randomChoice(selectOptions4),
      colText9: randomText(16),
      colNumber6: (Math.random() * 1500).toFixed(2),
    }));

    await db.insert(rows).values(batch);
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} (${i + batch.length} / ${totalRows})`);
  }

  console.log('Seeding complete!');
}

// Allow running as standalone script
if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error seeding:', err);
      process.exit(1);
    });
}
