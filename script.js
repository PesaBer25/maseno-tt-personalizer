const units = JSON.parse(localStorage.getItem("units")) || [];
let found = 0;
const add = document.querySelector('#add');
let myUnits = JSON.parse(localStorage.getItem("saved")) || [];

if(myUnits.length > 0){
    generateTable(myUnits);
}

function generateTable(any){
    let table1 = `<table style="width: 66vw">`;
    let table2 = `<table style="width: 66vw">`;
    let table3 = `<table style="width: 66vw">`;
    any.forEach(entry=>{
            if(entry.unit1.length > 0){
                table1 += `<tr><th rowspan="${entry.unit1.length + 1}">${day(entry['day'])}</th></tr><tr>`;
            }
            for(let i=0; i < entry.unit1.length; i++){
                table1 += `<td>${entry.unit1[i].name}</td><td>${entry.unit1[i].hall}</td></tr><tr>`;
            }
            table1 += `</tr>`;
            if(entry.unit2.length > 0){
                table2 += `<tr><th rowspan="${entry.unit2.length + 1}">${day(entry['day'])}</th></tr><tr>`;
            }
            for(let i=0; i < entry.unit2.length; i++){
                table2 += `<td>${entry.unit2[i].name}</td><td>${entry.unit2[i].hall}</td></tr><tr>`;
            }
            table2 += `</tr>`;
            if(entry.unit3.length > 0){
                table3 += `<tr><th rowspan="${entry.unit3.length + 1}">${day(entry['day'])}</th></tr><tr>`;
            }
            for(let i=0; i < entry.unit3.length; i++){
                table3 += `<td>${entry.unit3[i].name}</td><td>${entry.unit3[i].hall}</td></tr><tr>`;
            }
            table3 += `</tr>`;
    });
    table1 += `</table><br/>`;
    table2 += `</table><br/>`;
    table3 += `</table>`;
    const outputTT = document.querySelector('.output');
    outputTT.innerHTML = table1 + table2 + table3 + "<button class='download'>Save</button>";
    document.querySelector('.download').addEventListener('click',()=>{
        localStorage.setItem("saved",JSON.stringify(myUnits));
        alert("TimeTable Saved Successfully");
    });
}

function display(){
    let unitsTable = document.querySelector('.units');
    let text = `<table><tr><th>#</th><th>Code</th><th>Name</th><th>Edit</th></tr>`;
    units.forEach((value,index)=>{
        text += `<tr><td>${index+1}</td><td>${value.code}</td><td>${value.name}</td><td><button index=${index} class="edit">Remove</button></td></tr>`;  
    });
    text += `</table>`;
    unitsTable.innerHTML = text;
    if(units.length > 0){
        const remove = document.querySelectorAll('.edit');
        remove.forEach(btn=>{
            btn.addEventListener('click', e => {
                units.splice(e.target.getAttribute('index'),1);
                localStorage.setItem("units",JSON.stringify(units));
                display();
            });
        });
        
    }
}
display();

function day(serialDate){
    if(Number(serialDate)){
        const baseDate = new Date(1899, 11, 30);
        const convertedDate = new Date(baseDate.getTime() + serialDate * 24 * 60 * 60 * 1000);
        const day = convertedDate.toLocaleString("en-US", { weekday: "long" });
        const formattedDate = convertedDate.toLocaleDateString("en-GB");
        return `${day}, ${formattedDate}`;
    }else{
        return serialDate;
    }
   
}

let unitCode = document.querySelector('#code');
unitCode.addEventListener('keydown',(e)=>{
    if(e.key == "Enter"){
        selectUnits();
    }
});
function selectUnits(){
    let unitName = document.querySelector('#name');
    if(unitCode.value === ''){
        alert("Unit Code Cannot be empty");
    }else{
        units.push({code: unitCode.value, name: unitName.value});
        localStorage.setItem("units",JSON.stringify(units));
        unitCode.value = '';
        unitName.value = '';
        display();
    }
}
add.addEventListener('click',selectUnits);

const generate =  document.querySelector('.generate');
generate.addEventListener('click', ()=>{
    if(units.length <= 0){
        alert("You have to select your registered units");
        return;
    }
    const file = document.querySelector('#file').files[0];
    if(!file){
        alert("You haven't selected a source TimeTable");
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const data =  new Uint8Array(e.target.result);
        const workbook = XLSX.read(data,{type : "array"});
        const sheetName =  workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData =  XLSX.utils.sheet_to_json(sheet);
        const tempTT = {
            day: '',
            unit1: '',
            venue1: '',
            unit2: '',
            venue2: '',
            unit3: '',
            venue3: ''
        };
        const TT = [];
        jsonData.forEach(value=>{
            const keys = Object.keys(value);
            keys.forEach(key=>{
               const match = [" MASENO UNIVERSITY","__EMPTY","__EMPTY_2","__EMPTY_3","__EMPTY_5","__EMPTY_6","__EMPTY_8"];
               for(let i = 0; i < match.length; i++){
                if(match[i] == key){
                    if(i == 0){
                        tempTT['day'] = value[match[i]];
                    }else if(i == 1){
                        tempTT['unit1'] = value[match[i]];
                    }else if(i == 2){
                        tempTT['venue1'] = value[match[i]];
                    }else if(i == 3){
                        tempTT['unit2'] = value[match[i]];
                    }else if(i == 4){
                        tempTT['venue2'] = value[match[i]];
                    }else if(i == 5){
                        tempTT['unit3'] = value[match[i]];
                    }else if(i == 6){
                        tempTT['venue3'] = value[match[i]];
                    }
                }
               }
            });
            TT.push({...tempTT});
        });
        const wholeTT = [];

TT.forEach((obj, index) => {
    const format = {
        day: obj.day || "",
        unit1: [],
        unit2: [],
        unit3: []
    };

    // When the index is 2, directly populate the whole format object
    if (!obj['unit1']) {
        return; // Skip if unit1 is falsy
    } else if (index == 2) {
        format.day = obj.day;
        format.unit1.push({ name: obj.unit1, hall: [obj.venue1] });
        format.unit2.push({ name: obj.unit2, hall: [obj.venue2] });
        format.unit3.push({ name: obj.unit3, hall: [obj.venue3] });
        wholeTT.push({...format});
    } else {
        // If the day matches the last one, update units and halls
        if (obj['day'] === wholeTT[wholeTT.length - 1].day) {
            let lastEntry = wholeTT[wholeTT.length - 1];

            // Update unit1
            let unit1 = lastEntry.unit1.find(value => value.name === obj.unit1);
            if (unit1) {
                if (!unit1.hall.includes(obj.venue1)) {
                    unit1.hall.push(obj.venue1);
                }
            } else {
                lastEntry.unit1.push({ name: obj.unit1, hall: [obj.venue1] });
            }

            // Update unit2
            let unit2 = lastEntry.unit2.find(value => value.name === obj.unit2);
            if (unit2) {
                if (!unit2.hall.includes(obj.venue2)) {
                    unit2.hall.push(obj.venue2);
                }
            } else {
                lastEntry.unit2.push({ name: obj.unit2, hall: [obj.venue2] });
            }

            // Update unit3
            let unit3 = lastEntry.unit3.find(value => value.name === obj.unit3);
            if (unit3) {
                if (!unit3.hall.includes(obj.venue3)) {
                    unit3.hall.push(obj.venue3);
                }
            } else {
                lastEntry.unit3.push({ name: obj.unit3, hall: [obj.venue3] });
            }
        } else {
            // If it's a new day, push new format object
            format.day = obj.day;
            format.unit1.push({ name: obj.unit1, hall: [obj.venue1] });
            format.unit2.push({ name: obj.unit2, hall: [obj.venue2] });
            format.unit3.push({ name: obj.unit3, hall: [obj.venue3] });
            wholeTT.push({...format});
        }
    }
});
const regex = new RegExp(`^(${units.map(unit => unit.code).join('|')})`, 'i');
myUnits.push(wholeTT[0]);

wholeTT.forEach(each=>{
    each.unit1.forEach(n=>{
        if(regex.test(n.name)){
            found++;
            const format = {
                day: "",
                unit1: [],
                unit2: [],
                unit3: []
            };
            format.day = each.day;            
            format.unit1.push({ name: n.name, hall: [...n.hall] });
            myUnits.push({...format});
        }
    })
    
    each.unit2.forEach(n=>{
        if(regex.test(n.name)){
            found++;
            const format = {
                day: "",
                unit1: [],
                unit2: [],
                unit3: []
            };
            format.day = each.day;            
            format.unit2.push({ name: n.name, hall: [...n.hall] });
            myUnits.push({...format});
        }
    })
    each.unit3.forEach(n=>{
        if(regex.test(n.name)){
            found++;
            const format = {
                day: "",
                unit1: [],
                unit2: [],
                unit3: []
            };
            format.day = each.day;            
            format.unit3.push({ name: n.name, hall: [...n.hall] });
            myUnits.push({...format});
        }
    })
})


        // TT.forEach((obj,index)=>{
        generateTable(myUnits);
        let notFound = units.length - found;
        found = 0;
        if(notFound > 0){
            alert(`${notFound} unit(s) not found,\nDouble check the unit codes and generate again`);
        }
    }
    reader.readAsArrayBuffer(file);
});