
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();
//recognition.continuous = true;

const icon = document.querySelector('i.fa.fa-microphone')

$(function($){

  body = {
    intro : true
  }

  $.post("/intro", body ,function(intro){
    console.log(intro);
    speak1(intro, function(bool){
    
      if(bool){
        $("#chat").append($('<li>').text('Gizmo:: '+ intro));
      }
    });
    
  });
  myLoop()

});

function speak1(intro, callback){
  
  utterThis = new SpeechSynthesisUtterance(intro);
  synth.speak(utterThis);
  callback(true);

}

var i=0;
function myLoop () {           //  create a loop function
   setTimeout(function () {    //  call a 3s setTimeout when the loop is called
      dictate()          //  your code here
      i++;                     //  increment the counter
   }, 70)
}

//myLoop();

recognition.onsoundstart = function() {
  console.log('Some sound is being received');
}

recognition.onspeechend = function() {
  //console.log(recognition.stop() );
  console.log('Speech recognition has stopped.');
  myLoop()
}

recognition.onaudioend = function() {
  console.log('Audio capturing ended');
}

recognition.onerror = function(event) {
  console.log('Speech recognition error detected: ' + event.error);
  myLoop();
  
}

recognition.onstart = function() {
    console.log('Speech recognition service has started');
};

recognition.onend = function() {
    console.log('Speech recognition service disconnected');
    myLoop()
    
};

recognition.onsoundend = function() {
  console.log('Sound has stopped being received');
}

icon.addEventListener('click', () => {
//  sound.play();
  dictate();
});

const dictate = () => {
  recognition.start();
  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    console.log(speechToText);
    
    $("#chat").append($('<li>').text(speechToText));
    
    if (event.results[0].isFinal) {

      if (speechToText.includes(' time')) {
          $("#chat").append($('<li>').text(getTime));
          speak(getTime);
      }
      
      else if (speechToText.includes('what is today\'s date')) {
          $("#chat").append($('<li>').text(getDate));
          speak(getDate);
      }
      
      else if (speechToText.includes('what is the weather in')) {
        //$("#chat").append($('<li>').text(getTheWeather(speechToText)));
        getTheWeather(speechToText);

      }
      else{
        getReply(speechToText)
      }

    }
  }
}


function getReply(speechToText){
  body = {
      text : speechToText
    }
  $.post("/getReply", body ,function(reply){
    console.log('=================>  ', reply.toString())
    utterThis = new SpeechSynthesisUtterance(reply);
    synth.speak(utterThis);
    $("#chat").append($('<li>').text(reply));

  });

}



const speak = (action) => {
  utterThis = new SpeechSynthesisUtterance(action());
  synth.speak(utterThis);
};

const getTime = () => {
  const time = new Date(Date.now());
  return `the time is ${time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
};

const getDate = () => {
  const time = new Date(Date.now())
  return `today is ${time.toLocaleDateString()}`;
};

const getTheWeather = (speech) => {
  fetch(`http://api.openweathermap.org/data/2.5/weather?q=${speech.split(' ')[5]}&appid=58b6f7c78582bffab3936dac99c31b25&units=metric`) 
  .then(function(response){
    return response.json();
  })
  .then(function(weather){
    if (weather.cod === '404') {
      utterThis = new SpeechSynthesisUtterance(`I cannot find the weather for ${speech.split(' ')[5]}`);
      synth.speak(utterThis);
      return "I cannot find the weather for ${speech.split(' ')[5]}"
    }
    utterThis = new SpeechSynthesisUtterance(`the weather condition in ${weather.name} is mostly full of ${weather.weather[0].description} at a temperature of ${weather.main.temp} degrees Celcius`);
    synth.speak(utterThis);
  });
};



