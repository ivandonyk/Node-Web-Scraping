var axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

var now = new Date();
var utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
var shippingDate = utcNow.toLocaleDateString("en-us")+"&_="+ now.getTime();

const csvWriter = createCsvWriter({
	path: `./zipcode_${utcNow.getFullYear()}-${utcNow.getMonth()+1}-${utcNow.getDate()}.csv`,
	header: [
			{id: 'origin', title: 'Origin'},
			{id: 'destination', title: 'Destination'},
			{id: 'zone', title: 'Zone'},
	]
});

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function makeRecord(origin, recData) {
	const record = [];
	const zone = recData.Zone;
	const zipcodes = recData.ZipCodes;
	if (zipcodes.indexOf("---")>-1) {
		const zip_arr = zipcodes.split("---");
		const first_zip = Number(zip_arr[0]);
		const last_zip = Number(zip_arr[1]);
		for (let i = first_zip; i<=last_zip; i++){
			record.push({
				origin: origin,
				destination: ('000' + i).substr(-3),
				zone
			})
		}
	} else {
		record.push({
			origin,
			destination: zipcodes,
			zone
		})
	}

	return record;
}

async function makeCSV(zipcode, shippingDate){
	const records = [];
	return axios.get(
		`https://postcalc.usps.com/DomesticZoneChart/GetZoneChart?zipCode3Digit=${zipcode}&shippingDate=${shippingDate}`
	).then(async(res) => {
		await asyncForEach(res.data.Column0, async(el) => {
			const rec = await makeRecord(zipcode, el);
			records.push(...rec);
		});

		await asyncForEach(res.data.Column1, async(el) => {
			const rec = await makeRecord(zipcode, el)
			records.push(...rec);
		});

		await asyncForEach(res.data.Column2, async(el) => {
			const rec = await makeRecord(zipcode, el)
			records.push(...rec);
		});
		
		await asyncForEach(res.data.Column3, async(el) => {
			const rec = await makeRecord(zipcode, el)
			records.push(...rec);
		});

		return records;	
		
	}).catch((e)=>console.error(e));
}


asyncForEach(Array.from(Array(1000).keys()), async (i) => {
	const zipcode = ('000' + i).substr(-3);
	
	const re = await makeCSV(zipcode, shippingDate);
	if(re.length > 0) {
		csvWriter.writeRecords(re)
		.then(() => {
				console.log(zipcode + ': Saved');
		});
	}
});