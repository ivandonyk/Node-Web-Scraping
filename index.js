var axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

var now = new Date();
var shippingDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000).toLocaleDateString("en-us")+"&_="+ now.getTime();

const csvWriter = createCsvWriter({
	path: `./zipcode_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.csv`,
	header: [
			{id: 'origin', title: 'Origin'},
			{id: 'destination', title: 'Destination'},
			{id: 'zone', title: 'Zone'},
	]
});


async function makeCSV(zipcode, shippingDate){
	const records = [];
	axios.get(
		`https://postcalc.usps.com/DomesticZoneChart/GetZoneChart?zipCode3Digit=${zipcode}&shippingDate=${shippingDate}`
	).then(res => {
		res.data.Column0.forEach(el => {
			records.push({
				origin: zipcode,
				destination: el.ZipCodes,
				zone: el.Zone
			});
		});

		res.data.Column1.forEach(el => {
			records.push({
				origin: zipcode,
				destination: el.ZipCodes,
				zone: el.Zone
			});
		});

		res.data.Column2.forEach(el => {
			records.push({
				origin: zipcode,
				destination: el.ZipCodes,
				zone: el.Zone
			});
		});
		
		res.data.Column3.forEach(el => {
			records.push({
				origin: zipcode,
				destination: el.ZipCodes,
				zone: el.Zone
			});
		});

		csvWriter.writeRecords(records)
    .then(() => {
        console.log(zipcode + ': Done');
		});
		
	}).catch((e)=>console.log(e));
}

for(let i = 0; i<1000; i++){
	const zipcode = ('000' + i).substr(-3);
	makeCSV(zipcode, shippingDate);
}
