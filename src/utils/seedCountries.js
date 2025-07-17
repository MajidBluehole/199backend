// seedCountries.js
const defaultCountries = [
  { country_name: "United States" },
  { country_name: "India" },
  { country_name: "United Kingdom" },
  { country_name: "Canada" },
  { country_name: "Australia" },
  { country_name: "Germany" },
  { country_name: "France" },
  { country_name: "Brazil" },
  { country_name: "Japan" },
  { country_name: "South Korea" },
];

async function seedCountries(countryModel) {
  try {
    for (const country of defaultCountries) {
      await countryModel.findOrCreate({
        where: { country_name: country.country_name },
        defaults: country,
      });
    }
    console.log("✅ Default countries seeded.");
  } catch (error) {
    console.error("❌ Failed to seed countries:", error);
  }
}

module.exports = seedCountries;
