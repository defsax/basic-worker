window.onload = () => {
  console.log("onload...");
  const buttonID = document.getElementById("btn");
  const rangeInput = document.getElementById("speedSlider");
  rangeInput.value = 1;
  buttonID.disabled = false;
  btn.addEventListener("click", toggle);
  rangeInput.addEventListener("mouseup", updateSpeed);
  sessionStorage.clear();

  var worker;
  let useWorker = false;
  //trying to understand workers
  //create 'blob' to hold worker code
  //it calls back to script id inside the html
  var workerData = new Blob([document.getElementById("worker").textContent], {
    type: "application/javascript"
  });
  
  function toggle() {
    if (typeof(worker) == "undefined") {
      useWorker = true;
      initWorker();
      console.log("worker started...");
    } else {
      useWorker = false;
      worker.postMessage({ cmd: "stop" });
      //worker.terminate(); //removed since worker terminates itself using self.close()
      worker = undefined; //reset worker
    }
  }

  function initWorker() {
    if (typeof(Worker) !== "undefined") {
      document.getElementById("title1").innerHTML = "Web workers supported.";
      if (typeof(worker) == "undefined") {
        worker = new Worker(window.URL.createObjectURL(workerData));
      }

      worker.onmessage = function(event) {
        if (useWorker == true) {
          console.log(event.data);
          document.getElementById("title2").innerHTML = event.data;
        } else if (useWorker == false) {
          document.getElementById("title2").innerHTML = event.data;
          console.log("last received num from worker: " + event.data);
          //if good, store
          if (typeof Storage !== "undefined") {
            console.log("Web storage available.");
            sessionStorage.setItem("lastNum", event.data);
          } else {
            console.log("Web storage unavailable.");
          }
        }
      };
    } else {
      document.getElementById("title1").innerHTML =
        "Sorry! No web worker support.";
    }
    worker.postMessage({
      cmd: "start",
      num: sessionStorage.getItem("lastNum"),
      speed: rangeInput.value
    });
  }
  
  function updateSpeed() {
    switch(rangeInput.value){
      case '1':{
        document.getElementById("title3").innerHTML = "Worker speed: Fast!";
        break;
      }
      case '10':{
        document.getElementById("title3").innerHTML = "Worker speed: Slow...";
        break;
      }
      default:{
        document.getElementById("title3").innerHTML = "Worker speed: " + rangeInput.value;
        break;
      }
    }
    
    if(useWorker != false){
      worker.postMessage({cmd: "updateSpeed", speed: rangeInput.value});
      console.log("Slider = " + rangeInput.value);
    }
  }
  
  rangeInput.oninput = function(){
    document.getElementById("title3").innerHTML = "Worker speed: " + this.value;
  }
};
