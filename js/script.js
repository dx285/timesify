function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function date2string(date){
  var date = new Date(date);
  var months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  var month = months[ date.getMonth() ],
      day   = date.getDate(),
      year  = date.getFullYear();

  return month + " " + day + ", " + year;
}

function svc_search_v2_articlesearch(data){
  var docs = data.response.docs;
  var doc = docs[Math.floor(Math.random()*docs.length)];

  $("[data-role=subsection_name]").text(doc.subsection_name || doc.section_name)
  $("[data-role=headline]").text(doc.headline.main)
  $("[data-role=byline]").text(doc.byline.original)
  $("[data-role=date]").text(date2string(doc.pub_date))

  var snippet = doc.abstract || doc.snippet;
  var info = "<strong>In case anyone asks:</strong> " + snippet;
  $("[data-role=abstract]").html(info)

  for(var i = 0; i < doc.multimedia.length; i++){
    var multimedia = doc.multimedia[i];
    if(multimedia.subtype == "xlarge")
      break;
  }
  if(multimedia){
    $("[data-role=image-container]").show()
    var url = "http://static01.nyt.com/" + multimedia.url;
    var image = $('<img/>', { src: url, height: multimedia.height, width: multimedia.width })
    $("[data-role=image]").html(image)
  }
}

function article_content(data){
  var content = $(data.content);
  content.find('img').remove()
  content.find('p:empty').remove()
  content.find('h1, h2, h3, h4').replaceWith(function(){
    return $('<span/>', { html: this.innerHTML })
  })
  content.find('strong').replaceWith(function(){
    return $('<span/>', { html: this.innerHTML })
  })
  content.find('a').attr('target', '_blank')

  $("[data-role=fake-news]").html(content)

  if(data.images.length){
    var images = [$('[data-role=fake-ad]').attr('src')]
    for(var i = 0; i < data.images.length; i++){
      if(data.images[i].height > 100){
        images.push(data.images[i].url)
      }
    }
    var next = 1;
    $('[data-role=fake-ad]').on('click', function(){
      $(this).attr('src', images[next]);
      next = next + 1 == images.length ? 0 : next + 1;
    });
  }
}

var url = getParameterByName("url");
if(url){
  $.ajax({
    url: "http://api.nytimes.com/svc/search/v2/articlesearch.jsonp",
    data: {
      "sort": "newest",
      "api-key": "b00c6445871aabbc6ab8074a01028b59:19:69489929",
      "callback": "svc_search_v2_articlesearch",
      //"fl": "snippet,lead_paragraph,abstract,multimedia,headline,byline,web_url,section_name,news_desk",
      "fq": 'source:("The New York Times") AND section_name:("Business" "New York" "U.S." "World") AND type_of_material:("News")'
    },
    type: "GET",
    dataType: "script"
  });

  $.ajax({
    url: "http://api.embed.ly/1/extract",
    data: {
      key: "dfdc0e05b3a240b48dc082e50573bfe2",
      url: url,
      format: "json"
    },
    type: "GET",
    dataType: "jsonp",
    jsonpCallback: "article_content"
  });
}

$('html').addClass('has-big-ad')
