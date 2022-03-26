import React,{useState,useEffect} from 'react';
import './App.css';
import moment from 'moment';

function App() {
  const [data,setData]=useState([]);
  const [data1,setData1]=useState([]);
  const [months,setMonths]=useState([]);
  const [selectDate,setSelectDate]=useState(moment().format('YYYY-MM-DD'));
  const [shortage,setShortage]=useState(true);
  const [category,setCategory]=useState();
  const [pType,setPtype]=useState();
  const [showProduct,setShowProduct]=useState(false);
  const [showHours,setShowHours]=useState(true);
  const [product,setProduct]=useState('All');

  let textInput = React.createRef();
  let dateInput = React.createRef();

  const getData=()=>{
    fetch(`${process.env.PUBLIC_URL}/data/product.json`)
    .then(function(response){
      return response.json();
    })
    .then(function(myJson) {
      setData(myJson)
      setData1(myJson)
    });
  }
  useEffect(()=>{
    getData()
    handleDates()
  },[])

  //for filter by select category
  const handleCategory=(event)=>{
    const filterData = [];
    data1.forEach((d) => {
      if(d.category === event.target.value && pType === undefined){
        filterData.push(d)
      }else if(d.category === event.target.value && pType === d.productType){
        filterData.push(d);
      }else if(event.target.value === "All"){
        filterData.push(d);
      }
    });
    setCategory(event.target.value)
    setData(filterData)
  }

  //for filter by product types
  const handleProductType=(event)=>{
    const filterData = [];
    data1.forEach((d) => {
      if(d.productType === event.target.value && category === undefined){
        filterData.push(d);
      }else if(d.productType === event.target.value && category === d.category){
        filterData.push(d);
      }else if(d.productType === event.target.value && category === "All"){
        filterData.push(d);
      }
    });
    setPtype(event.target.value);
    setData(filterData);
  }

  //for filter by shortages
  const handleShortages=(event)=>{
    const filterData = [];
    data1.forEach((d) => {
      if(d.shortages === event.target.checked){
        filterData.push(d);
      }
    });
    setData(filterData);
    setShortage(!shortage);
  }

  //for filter by serach box
  const handleSearchBox=()=>{
    const filterData = [];
    data1.forEach((d) => {
      if(d.productName === textInput.current.value){
        filterData.push(d);
      }
    });
    setData(filterData);
  }

  //for filter by dates
  const handleDates=()=>{
    var startString = dateInput.current.value;
    fetch(`${process.env.PUBLIC_URL}/data/product.json`)
    .then(function(response){
      return response.json();
    })
    .then(function(myJson) {
      var startParts = startString.split('-');
      var startDate = new Date(startParts[0], startParts[1]-1, startParts[2]);
      var in30DaysDate = new Date(startParts[0], startParts[1]-1, startParts[2]); 

      in30DaysDate.setDate(startDate.getDate() + 30)

      const loopDays = [];
      const loopDates = [];
      const avalables1 = [];
      myJson.forEach((p, i) => {
        var backgraundColor = "white";
        if(p.total >= 2){
          backgraundColor = "#66B132";
        }else if(p.total <= 1 && p.total > 0){
          backgraundColor = "#FF8000";
        }else if(p.total <= 0){
          backgraundColor = "#A52A45";
        }
        avalables1.push({'count': p.total, 'p_id': p.id, 'colors': backgraundColor, 'fullTime': '', 'hours': ''})
      });
      for (var d = startDate; d <= in30DaysDate; d.setDate(d.getDate() + 1)) {
        var loopDay = new Date(d);
        loopDays.push({'dates': moment(loopDay).format("ddd, D MMM"), 'availables': avalables1});
        loopDates.push(moment(loopDay).format("YYYY-MM-DD"));
      }

      const availables = [];
      myJson.forEach((p, i) => {
        for(let j = 0; j <= loopDates.length; j++){
          p.available.forEach((d) => {
            var startTime = moment(d.from, 'hh:mm a');
            var endTime = moment(d.to, 'hh:mm a');
            var fTime = d.from + '-' + d.to
            var hoursDiff = endTime.diff(startTime, 'hours');
            if(d.id === p.id && d.date === loopDates[j] && d.type === p.productType && d.qty !== '') {
              availables.push({'avail': p.total - parseInt(d.qty), 'matchDates': d.date, 'p_id': p.id, 'fTime': fTime, 'fHours': hoursDiff});
            }
          });
        }
      });

      let arr2 = [];
      availables.forEach((element) => {
        let match = arr2.find((r) => r.matchDates === element.matchDates);
        if (match) {
        } else {
          arr2.push({ matchDates: element.matchDates, value: [] });
        }
      });
      arr2.forEach((item) => {
        availables.forEach((e) => {
          if (e.matchDates === item.matchDates) {
            var backgraundColor = "white";
            if(e.avail >= 2){
              backgraundColor = "#66B132";
            }else if(e.avail <= 1 && e.avail > 0){
              backgraundColor = "#FF8000";
            }else if(e.avail <= 0){
              backgraundColor = "#A52A45";
            }
            item.value.push({'count': e.avail, 'p_id': e.p_id, 'colors': backgraundColor, 'fullTime': e.fTime, 'hours': e.fHours});
          }
        });
      });
      arr2.forEach((item) => {
        myJson.forEach((p, i) => {
          var m = item.value.findIndex(x => x.p_id === p.id);
          if(m <= -1){
            item.value.push({'count': p.total, 'p_id': p.id, 'colors': '#66B132', 'fullTime': '', 'hours': ''});
          }
        });
      });

      arr2.forEach((t) => {
       for(var l = 0; l <= loopDates.length; l++){
         if(t.matchDates === loopDates[l]){
           loopDays[l]['availables'] = t.value;
         }
       }
      });
      setMonths(loopDays);
    });
    setSelectDate(dateInput.current.value);
  }

  //for filter by days periods
  const handleDayPeriod=(event)=>{
    var days = event.target.value;
    var date = dateInput.current.value;
    const hours = [
      {'times': '12:00 am'},
      {'times': '1:00 am'},
      {'times': '2:00 am'},
      {'times': '3:00 am'},
      {'times': '4:00 am'},
      {'times': '5:00 am'},
      {'times': '6:00 am'},
      {'times': '7:00 am'},
      {'times': '8:00 am'},
      {'times': '9:00 am'},
      {'times': '10:00 am'},
      {'times': '11:00 am'},
      {'times': '12:00 pm'},
      {'times': '1:00 pm'},
      {'times': '2:00 pm'},
      {'times': '3:00 pm'},
      {'times': '4:00 pm'},
      {'times': '5:00 pm'},
      {'times': '6:00 pm'},
      {'times': '7:00 pm'},
      {'times': '8:00 pm'},
      {'times': '9:00 pm'},
      {'times': '10:00 pm'},    
      {'times': '11:00 pm'}
    ];
    fetch(`${process.env.PUBLIC_URL}/data/product.json`)
    .then(function(response){
      return response.json();
    })
    .then(function(myJson) {
      var loopDays = [];
      var loopDates = [];
      const avalables1 = [];
      myJson.forEach((p, i) => {
        var backgraundColor = "white";
        if(p.total >= 2){
          backgraundColor = "#66B132";
        }else if(p.total <= 1 && p.total > 0){
          backgraundColor = "#FF8000";
        }else if(p.total <= 0){
          backgraundColor = "#A52A45";
        }
        avalables1.push({'count': p.total, 'p_id': p.id, 'colors': backgraundColor, 'fullTime': '', 'fromT': '', 'toT': '', 'hours': ''})
      });
      if (days.indexOf('hours') > -1){
        setShowProduct(true)
        var startParts = date.split('-');
        var startDate = new Date(startParts[0], startParts[1]-1, startParts[2]);
        var in30DaysDate = new Date(startParts[0], startParts[1]-1, startParts[2]);
        in30DaysDate.setDate(startDate.getDate() + 30)
        for (var d = startDate; d <= in30DaysDate; d.setDate(d.getDate() + 1)) {
          var loopDay = new Date(d);
          loopDays.push({'dates': moment(loopDay).format("ddd, D MMM"), 'availables': avalables1});
          loopDates.push(moment(loopDay).format("YYYY-MM-DD"));
        }
        setShowHours(false);
        myJson.forEach((d, j) => {
          myJson[j]['hours'] = hours
        });
        setData(myJson)
        setProduct('All');
      }else if(days === '30'){
        for (let n = 1; n <= days; n++){
          loopDates.push(moment(date).add(n, "days").format("YYYY-MM-DD"));
          loopDays.push({'dates': moment(date).add(n, "days").format("ddd, D MMM"), 'availables': avalables1});
        }
        setShowHours(true);
        setShowProduct(false);
        myJson.forEach((d, j) => {
          myJson[j]['hours'] = []
        });
        setData(myJson)
        setProduct('All');
      }else{
        if(days === '7'){
          setShowProduct(true)
          setShowHours(false);
          myJson.forEach((d, j) => {
            myJson[j]['hours'] = hours
          });
          setData(myJson)
        }else{
          setShowProduct(false)
        }
        for (let n = 1; n <= days; n++){
          loopDates.push(moment(date).add(n, "days").format("YYYY-MM-DD"));
          loopDays.push({'dates': moment(date).add(n, "days").format("ddd, D MMM"), 'availables': avalables1});
        }
      }
      const availbales = [];
      myJson.forEach((p, i) => {
        for(let j = 0; j <= loopDates.length; j++){
          p.available.forEach((d) => {
            var startTime = moment(d.from, 'hh:mm a');
            var endTime = moment(d.to, 'hh:mm a');
            var fTime = d.from + '-' + d.to
            var hoursDiff = endTime.diff(startTime, 'hours');
            if(d.id === p.id && d.date === loopDates[j] && d.type === p.productType && d.qty !== '') {
              if (days.indexOf('hours') > -1){
                days.split('');
                if(parseInt(days[0]) === parseInt(hoursDiff)){
                  availbales.push({'avail': p.total - parseInt(d.qty), 'matchDates': d.date, 'p_id': p.id, 'fTime': fTime, 'fromT': d.from, 'toT': d.to, 'fHours': hoursDiff});
                }
              }else{
                availbales.push({'avail': p.total - parseInt(d.qty), 'matchDates': d.date, 'p_id': p.id, 'fTime': fTime, 'fromT': d.from, 'toT': d.to, 'fHours': hoursDiff});
              }
            }
          });
        }
      });

      let arr2 = [];
      availbales.forEach((element) => {
        let match = arr2.find((r) => r.matchDates === element.matchDates);
        if (match) {
        } else {
          arr2.push({ matchDates: element.matchDates, value: [] });
        }
      });
      arr2.forEach((item) => {
        availbales.forEach((e) => {
          if (e.matchDates === item.matchDates) {
            var backgraundColor = "white";
            if(e.avail >= 2){
              backgraundColor = "#66B132";
            }else if(e.avail <= 1 && e.avail > 0){
              backgraundColor = "#FF8000";
            }else if(e.avail <= 0){
              backgraundColor = "#A52A45";
            }
            item.value.push({'count': e.avail, 'p_id': e.p_id, 'colors': backgraundColor, 'fullTime': e.fTime, 'fromT': e.fromT, 'toT': e.toT, 'hours': e.fHours});
          }
        });
      });

      arr2.forEach((item) => {
        myJson.forEach((p, i) => {
          var m = item.value.findIndex(x => x.p_id === p.id);
          if(m <= -1){
            item.value.push({'count': p.total, 'p_id': p.id, 'colors': '#66B132', 'fullTime': '', 'fromT': '', 'toT': '', 'hours': ''});
          }
        });
      });

      arr2.forEach((t) => {
        for(var l = 0; l <= loopDates.length; l++){
          if(t.matchDates === loopDates[l]){
            loopDays[l]['availables'] = t.value;
          }
        }
      });
      setMonths(loopDays);
    });
  }

  //for filter by select products
  const handleProducts=(event)=>{
    const filterData = [];
    const hours = [
      {'times': '12:00 am'},
      {'times': '1:00 am'},
      {'times': '2:00 am'},
      {'times': '3:00 am'},
      {'times': '4:00 am'},
      {'times': '5:00 am'},
      {'times': '6:00 am'},
      {'times': '7:00 am'},
      {'times': '8:00 am'},
      {'times': '9:00 am'},
      {'times': '10:00 am'},
      {'times': '11:00 am'},
      {'times': '12:00 pm'},
      {'times': '1:00 pm'},
      {'times': '2:00 pm'},
      {'times': '3:00 pm'},
      {'times': '4:00 pm'},
      {'times': '5:00 pm'},
      {'times': '6:00 pm'},
      {'times': '7:00 pm'},
      {'times': '8:00 pm'},
      {'times': '9:00 pm'},
      {'times': '10:00 pm'},    
      {'times': '11:00 pm'}
    ];
    data1.forEach((d) => {
      if(d.productName === event.target.value){
        filterData.push(d)
        setShowHours(false);
      }else if(event.target.value === 'All'){
        filterData.push(d)
        setShowHours(false);
      }
    });
    filterData.forEach((d, j) => {
      filterData[j]['hours'] = hours
    });
    if(event.target.value === "All"){
      setData(filterData)
    }else{
      setData(filterData)
    }
    setProduct(event.target.value);
  }

  return (
    <>
      <form>
        <label htmlFor="productCategory">Product Category</label>
        <select id="productCategory" onChange={handleCategory}>
          <option value="All">All</option>
          <option value="CONSUMABLES">CONSUMABLES</option>
          <option value="CAMERA">CAMERA</option>
          <option value="SITE OFFICE">SITE OFFICE</option>
          <option value="CHARGES">CHARGES</option>
          <option value="JACK HAMMER">JACK HAMMER</option>
          <option value="COMPUTER">COMPUTER</option>
        </select>
        <div style={{'width':'35px'}}>
          <label></label>
          <input type="checkbox" id="gridCheck"/>
        </div>
        <div>
          <label htmlFor="itemtosearch">Search Item</label>
          <div>
            <input ref={textInput} type="text" id="itemtosearch" placeholder="search" title="search"/>
            <span>
              <button type="button" onClick={handleSearchBox} id="searchitems">Ok</button>
            </span>
          </div>
        </div>
        <div>
          <label>Product type</label>
          <div className="radio-toolbar" data-toggle="buttons">
            <input type="radio" id="radioRental" name="options" value="rental" onChange={handleProductType}/>
            <label htmlFor="radioRental">Rental</label> <input type="radio" id="radioSell" name="options" value="sell" onChange={handleProductType}/>
            <label htmlFor="radioSell">Sell</label>
            <input type="radio" id="radioService" name="options" value="service" onChange={handleProductType}/>
            <label htmlFor="radioService">Service</label>
          </div>
        </div>
        <div>
          <label>Shortages</label>
          <div>
            <label className="switch">
              <input type="checkbox" checked={shortage} onChange={handleShortages}/>
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="datepicker">Start Date</label>
          <div>
            <input type="date" ref={dateInput} value={selectDate} id="datepicker" onChange={handleDates}/>
          </div>
        </div>
        <div>
          <label htmlFor="dayPeriod">Days period</label>
          <select id="dayPeriod" onChange={handleDayPeriod}>
            <option value="30">Select Days</option>
            <option value="1">1 Day</option>
            <option value="2">2 Days</option>
            <option value="3">3 Days</option>
            <option value="4">4 Days</option>
            <option value="5">5 Days</option>
            <option value="6">6 Days</option>
            <option value="7">7 Days</option>
            <option value="1 hours">1 hour</option>
            <option value="2 hours">2 hours</option>
            <option value="3 hours">3 hours</option>
            <option value="4 hours">4 hours</option>
          </select>
        </div>
        {showProduct ? <div>
          <label htmlFor="dayPeriod">Days period</label>
          <select id="dayPeriod" value={product} onChange={handleProducts}>
            <option value="All">All</option>
            <option value="Canon EOS19 Camera">Canon EOS19 Camera</option>
            <option value="Fully Insulated site office Donga">Fully Insulated site office Donga</option>
            <option value="AAA Batteries 5 Pack">AAA Batteries 5 Pack</option>
            <option value="Onsite Service">Onsite Service</option>
            <option value="ELECTRIC SCISSOR LIFT 26FT (ELECTRIC)">ELECTRIC SCISSOR LIFT 26FT (ELECTRIC)</option>
            <option value="Desktop">Desktop</option>
          </select>
        </div> : null}
      </form>
      <div style={{'paddingTop': '5px'}}>
        <div>
          <table className="product-table">
            <thead>
              <tr>
                <th style={{'width':'15%'}}>Product Name</th>
                {showHours ? null : <th style={{'width':'5%'}}>Hours</th> }
                {
                  months && months.length>0 && months.map((val,i) =>(
                  <td key={i}>{val.dates}</td>
                  ))
                }
              </tr>
            </thead>
            <tbody>
            {
              data && data.length>0 && data.map((value,index) =>(
              value.hours && value.hours.length>0 ?
              value.hours.map((value1,index1) =>
              <tr key={index1}>
                {index1 === 0 ? (<td className="itam_names"><strong>{value.productName}</strong></td>):(<td className="itam_names"></td>)}
                <td>{value1.times}</td>
                {
                  months && months.length>0 && months.map((num, j)=> 
                  num.availables && num.availables.length > 0 ? 
                  num.availables.map((num1, k)=> 
                  value.id === num1.p_id ? (
                  value1.times !== "" ? (
                    moment(value1.times, 'hh:mm a') >= moment(num1.fromT, 'hh:mm a') && moment(value1.times, 'hh:mm a') <= moment(num1.toT, 'hh:mm a') ? (
                      <td className="tooltip1" key={k} style={{backgroundColor: num1.colors, 'color': 'white'}} title={'Available:'+num1.count+' Total:'+value.total}>
                      {num1.fullTime !== "" ? (
                       <span className="custom-span-text"><strong>Time: </strong>{num1.fullTime} <strong>Hours: </strong>{num1.hours}</span>
                      ) : (null)}
                      {num1.count}<br/>({value.total})
                      </td>
                    ) : (<td key={k} style={{backgroundColor: '#66B132', 'color': 'white'}} title={'Available:'+num1.count+' Total:'+value.total}>
                      {value.total}<br/>({value.total})
                      </td>)
                  ): (<td key={k} style={{backgroundColor: num1.colors, 'color': 'white'}} title={'Available:'+num1.count+' Total:'+value.total}>
                      {num1.count}<br/>({value.total})
                      </td>)
                  )
                  : (null))
                  : <td key={j} style={{'backgroundColor': '#66B132', 'color': 'white'}} title={'Available:'+value.total+' Total:'+value.total}>{value.total}<br/>({value.total})</td>
                  )
                }
              </tr>
              ) : (
              <tr key={index}>
                <td className="itam_names"><strong>{value.productName}</strong></td>
                {
                  months && months.length>0 && months.map((num, j)=> 
                  num.availables && num.availables.length > 0 ? 
                  num.availables.map((num1, k)=> 
                  value.id === num1.p_id ? (
                  value.times !== "" ? (
                    moment(value.times, 'hh:mm a') >= moment(num1.fromT, 'hh:mm a') && moment(value.times, 'hh:mm a') <= moment(num1.toT, 'hh:mm a') ? (
                      <td className="tooltip1" key={k} style={{backgroundColor: num1.colors, 'color': 'white'}} title={'Available:'+num1.count+' Total:'+value.total}>
                      {num1.fullTime !== "" ? (
                       <span className="custom-span-text"><strong>Time: </strong>{num1.fullTime} <strong>Hours: </strong>{num1.hours}</span>
                      ) : (null)}
                      {num1.count}<br/>({value.total})
                      </td>
                    ) : (<td key={k} style={{backgroundColor: '#66B132', 'color': 'white'}} title={'Available:'+num1.count+' Total:'+value.total}>
                      {value.total}<br/>({value.total})
                      </td>)
                  ): (<td key={k} style={{backgroundColor: num1.colors, 'color': 'white'}} title={'Available:'+num1.count+' Total:'+value.total}>
                      {num1.count}<br/>({value.total})
                      </td>)
                  )
                  : (null))
                  : <td key={j} style={{'backgroundColor': '#66B132', 'color': 'white'}} title={'Available:'+value.total+' Total:'+value.total}>{value.total}<br/>({value.total})</td>
                  )
                }
              </tr>
              )
              ))
            }
            </tbody>
          </table>
        </div>
      </div>
    </>
    );
  }

  export default App;