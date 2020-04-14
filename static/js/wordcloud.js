var myConfig = {
    type: 'wordcloud',
    options: {
      text: success_text,
      minLength: 5,
      ignore: stopwords,
      maxItems: 40,
      aspect: 'flow-center',
      rotate: true,
      colorType: 'palette',
      palette: ['#D32F2F','#5D4037','#1976D2','#E53935','#6D4C41','#1E88E5','#F44336','#795548','#2196F3','#EF5350','#8D6E63','#42A5F5'],
      
      style: {
        fontFamily: 'Crete Round',
        
        hoverState: {
          backgroundColor: '#D32F2F',
          borderRadius: 2,
          fontColor: 'white'
        },
        tooltip: {
          text: '%text: %hits',
          visible: true,
          
          alpha: 0.9,
          backgroundColor: '#1976D2',
          borderRadius: 2,
          borderColor: 'none',
          fontColor: 'white',
          fontFamily: 'Georgia',
          textAlpha: 1
        }
      }
    },
};
   
zingchart.render({ 
    id: 'successful-words', 
    data: myConfig, 
    height: 300, 
    width: '100%' 
});