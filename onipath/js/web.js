// Alchemy Data Setup
'use strict';
var AlchemyDataNewsV1 = require('watson-developer-cloud/alchemy-data-news/v1');
var alchemy_data_news = new AlchemyDataNewsV1({
    api_key: // API key goes here
});
var params = {
    outputMode: 'json',
    start: 'now-1d', // begin time
    end: 'now', // end time
    count: 50, // max items to return
    dedupThreshold: '0.7', // remove duplicates
    rank: 'medium', // level of publisher
    return: 'enriched.url.title,enriched.url.url,enriched.url.enrichedTitle.entities,enriched.url.enrichedTitle.docSentiment',
    'q.enriched.url.enrichedTitle.entities.entity.text': '', // topic to search for
    'q.enriched.url.enrichedTitle.keywords.keyword.text': ''
};
// -- end

// p5 Canvas
var P5 = require('p5');

const canvas_width = 960;
const canvas_height = 720; // is divided by 2
const canvas_bg_color = "#D1DBBD";

const node_size = 160;
const node_font_size = 14;
const node_font_type = "Helvetica-Light";
const node_font_color = "#193441";
const node_bg_color = "#FCFFF5";
const node_neg_color = "#ff471a";
const node_pos_color = "#00e64d";

var starting_node = "Elon Musk";

const edge_length = 260;
const edge_color = "#193441";
const edge_width = 4;

const bg_line_color = "#3E606F";
const rand_speed = 5;

const trans1_length = 25;
const trans2_length = 25;

const min_relevance = 0.3;
const max_nodes = 9;

function get_today() {
    var today = new Date();
    
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 
    
    return mm+'/'+dd+'/'+yyyy;
}

var date_today = get_today();
var days_ago = 1;

var canvas_is_created = 0;
var first_generation = 0;

const s = function(p) {
    // Nodes
    
    
    var nodes = [];
    var cur_node;
    var selected_node;
    
    var transition = 0;
    
    var rand_line_angle = 0;
    var rand_start = 0;
    var rand_height = 0;
    var rand_direction = -1;
    var rand_lheight = 0;
    
    var entity_hash = {};
    var entities = [];
    var entity_count = [];
    var relevance = [];
    var sentiment = [];
                
    var article_titles = [];
    var article_urls = [];
    var article_sentiments = [];
    
    var update_nodes = function() {
        cur_node = nodes[selected_node];
        nodes = [];
        
        if (first_generation === 2) {
            nodes[0] = new Node("", 0);
            cur_node = new Node("Biggest Topics", 0.0);
        }
        
        for (var j = 0; j < entities.length && nodes.length < max_nodes; j++) {
            var rel = (relevance[j]/entity_count[j]);
            //console.log(entities[j] + " " + rel)
            if (entities[j] != cur_node.getTitle() && rel >= min_relevance) {
                nodes[nodes.length] = new Node(entities[j], (sentiment[j]/entity_count[j]));
                //console.log("new node: " + nodes[nodes.length-1].getTitle() + " " + nodes.length);
            }
        }
        
        var html_str = "";
        for (var j = 0; j < article_titles.length; j++) {
            
            html_str += "<li><a href='" + article_urls[j] + "'>" + article_titles[j] + "</a> - Tone: ";
            if (article_sentiments[j] === 0) {
                html_str += "neutral";
            } else if (article_sentiments[j] < 0) {
                html_str += "negative";
            } else {
                html_str += "positive";
            }
            html_str += "</li>";
            
        }
        document.getElementById("news-list").innerHTML = html_str;
        
        document.getElementById("news-head").innerHTML = "News Articles for <b>" + cur_node.getTitle() + "</b> from <b>" + date_today + "</b";
        
        transition = trans1_length+1;
    }
    
    // p5
    p.setup = function() {
        if (canvas_is_created === 0) {
            p.createCanvas(canvas_width, canvas_height).parent("web-canvas");
            
            cur_node = new Node("Click for Trending Topics", 0.0);
            nodes[0] = new Node(starting_node, 0.0);
            
            var today = new Date(Date.now());
            
            document.getElementById("query-month").value = today.getMonth()+1;
            document.getElementById("query-day").value = today.getDate();
            document.getElementById("query-year").value = today.getFullYear();
            
            canvas_is_created = 1;
        }
    };
    
    p.draw = function() {
        p.background(canvas_bg_color);
        
        if (rand_direction === -1) {
            rand_line_angle = Math.random() * Math.PI;
            rand_direction = Math.floor(Math.random() * 4);
            
            if (rand_direction === 0 || rand_direction === 2) {
                rand_start = Math.floor(Math.random()*canvas_width);
                rand_lheight = Math.floor(Math.random()*(canvas_width/2 - canvas_width/4) + canvas_width/4);
            } else {
                rand_start = Math.floor(Math.random()*canvas_height);
                rand_lheight = Math.floor(Math.random()*(canvas_height/2 - canvas_height/4) + canvas_height/4);
            }
            
            if (rand_direction === 1) {
                rand_line_angle -= Math.PI/2;
            }
            if (rand_direction === 2) {
                rand_line_angle *= -1;
            }
            if (rand_direction == 3) {
                rand_line_angle += Math.PI/2;
            }
            
            rand_height = -rand_lheight;
        }
        
        rand_height += rand_speed;
        //console.log(rand_height + rand_direction);
        
        p.stroke(bg_line_color);
        p.strokeWeight(edge_width);
        
        var t1 = rand_height / Math.tan(rand_line_angle);
        var t2 = (rand_height+rand_lheight) / Math.tan(rand_line_angle);
        
        if (rand_direction === 0) {
            
            p.line(t1 + rand_start, rand_height, t2 + rand_start, rand_height+rand_lheight);
            
            if (t1 + rand_start < 0 || t1 + rand_start > canvas_width || rand_height > canvas_height) {
                rand_direction = -1;
            }
            
        } else if (rand_direction === 1) {
            
            p.line(rand_height, t1 + rand_start, rand_height+rand_lheight, t2 + rand_start);
            
            if (t1 + rand_start < 0 || t1 + rand_start > canvas_height || rand_height > canvas_width) {
                rand_direction = -1;
            }
            
        } else if (rand_direction === 2) {
            
            p.line(t1 + rand_start, canvas_height - rand_height, t2 + rand_start, canvas_height - (rand_height+rand_lheight));
            
            if (t1 + rand_start < 0 || t1 + rand_start > canvas_width || rand_height < 0) {
                rand_direction = -1;
            }
            
        } else if (rand_direction === 3) {
            
            p.line(canvas_width - rand_height, t1 + rand_start, canvas_width - (rand_height+rand_lheight), t2 + rand_start);
            
            if (t1 + rand_start < 0 || t1 + rand_start > canvas_height || rand_height < 0) {
                rand_direction = -1;
            }
            
        }
        
        if (first_generation === 0 || first_generation === 2) {
            nodes[0].title = document.getElementById("topic-name").value;
        }
        
        for (var i = 0; i < nodes.length; i++) {
            var tx; 
            var ty; 
            //var p_trans = 0;
            
            if (transition > 0 && transition < trans1_length && selected_node === i) {
                
                tx = canvas_width/2 + (edge_length*(trans1_length-transition)/(trans1_length)) * Math.cos((-selected_node/nodes.length)*(2*Math.PI) + (Math.PI/2));
                ty = canvas_height/2 + (edge_length*(trans1_length-transition)/(trans1_length)) * Math.sin((-selected_node/nodes.length)*(2*Math.PI) + (Math.PI/2));
                
                p.stroke(p.lerpColor(p.color(edge_color), p.color(canvas_bg_color), transition/trans1_length));
                p.strokeWeight(edge_width);
                p.line(canvas_width/2, canvas_height/2, tx, ty);
                
                continue;
                
            } else if (transition >= trans1_length) {
                
                transition -= trans1_length;
                
                tx = canvas_width/2 + (edge_length*(transition)/(trans2_length)) * Math.cos((-i/nodes.length)*(2*Math.PI) + (Math.PI/2));
                ty = canvas_height/2 + (edge_length*(transition)/(trans2_length)) * Math.sin((-i/nodes.length)*(2*Math.PI) + (Math.PI/2));
                
                p.stroke(p.lerpColor(p.color(edge_color), p.color(canvas_bg_color), 1 - transition/trans2_length));
                p.strokeWeight(edge_width);
                p.line(canvas_width/2, canvas_height/2, tx, ty);
            
                p.strokeWeight(edge_width);
                p.fill(p.lerpColor(p.color(p.lerpColor(p.color(node_neg_color), p.color(node_pos_color), (1+nodes[i].getSentiment())/2)), p.color(canvas_bg_color), 1 - transition/trans2_length));
                p.ellipse(tx, ty, node_size, node_size);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(node_font_size);
                p.textFont(node_font_type);
                p.fill(p.lerpColor(p.color(node_font_color), p.color(canvas_bg_color), 1 - transition/trans2_length));
                p.strokeWeight(1);
                p.text(nodes[i].getTitle(), tx, ty);
                
                transition += trans1_length
                
            } else {
                
                tx = canvas_width/2 + edge_length * Math.cos((-i/nodes.length)*(2*Math.PI) + (Math.PI/2));
                ty = canvas_height/2 + edge_length * Math.sin((-i/nodes.length)*(2*Math.PI) + (Math.PI/2));
                
                p.stroke(p.lerpColor(p.color(edge_color), p.color(canvas_bg_color), transition/trans1_length));
                p.strokeWeight(edge_width);
                p.line(canvas_width/2, canvas_height/2, tx, ty);
            
                p.strokeWeight(edge_width);
                p.fill(p.lerpColor(p.color(p.lerpColor(p.color(node_neg_color), p.color(node_pos_color), (1+nodes[i].getSentiment())/2)), p.color(canvas_bg_color), transition/trans1_length));
                p.ellipse(tx, ty, node_size, node_size);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(node_font_size);
                p.textFont(node_font_type);
                p.fill(p.lerpColor(p.color(node_font_color), p.color(canvas_bg_color), transition/trans1_length));
                p.strokeWeight(1);
                p.text(nodes[i].getTitle(), tx, ty);
                
            }
        }
        
        if (transition >= trans1_length) {
            
            p.strokeWeight(edge_width);
            p.fill(p.lerpColor(p.color(node_neg_color), p.color(node_pos_color), (1+cur_node.getSentiment())/2));
            p.ellipse(canvas_width/2, canvas_height/2, node_size, node_size);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(node_font_size);
            p.textFont(node_font_type);
            p.fill(node_font_color);
            p.strokeWeight(1);
            p.text(cur_node.getTitle(), canvas_width/2, canvas_height/2);
            
        } else {
            
            p.strokeWeight(edge_width);
            p.fill(p.lerpColor(p.color(p.lerpColor(p.color(node_neg_color), p.color(node_pos_color), (1+cur_node.getSentiment())/2)), p.color(canvas_bg_color), transition/trans1_length));
            p.ellipse(canvas_width/2, canvas_height/2, node_size, node_size);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(node_font_size);
            p.textFont(node_font_type);
            p.fill(p.lerpColor(p.color(node_font_color), p.color(canvas_bg_color), transition/trans1_length));
            p.strokeWeight(1);
            p.text(cur_node.getTitle(), canvas_width/2, canvas_height/2);
            
        }
        
        if (transition > 0 && transition < trans1_length && first_generation === 1) {
            var tx = canvas_width/2 + (edge_length*(trans1_length-transition)/(trans1_length)) * Math.cos((-selected_node/nodes.length)*(2*Math.PI) + (Math.PI/2));
            var ty = canvas_height/2 + (edge_length*(trans1_length-transition)/(trans1_length)) * Math.sin((-selected_node/nodes.length)*(2*Math.PI) + (Math.PI/2));
            
            p.strokeWeight(edge_width);
            p.fill(p.lerpColor(p.color(node_neg_color), p.color(node_pos_color), (1+nodes[selected_node].getSentiment())/2));
            p.ellipse(tx, ty, node_size, node_size);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(node_font_size);
            p.textFont(node_font_type);
            p.fill(node_font_color);
            p.strokeWeight(1);
            p.text(nodes[selected_node].getTitle(), tx, ty);
        }
        
        if (transition > 0 && transition <= trans1_length) {
            transition++;
        }
        if (transition === trans1_length) {
            update_nodes();
        }
        if (transition > trans1_length) {
            transition++;
        }
        if (transition === trans1_length+trans2_length) {
            transition = 0;
        }
    };
    
    p.mouseReleased = function() {
        if (first_generation === 0 && (canvas_width/2-p.mouseX)*(canvas_width/2-p.mouseX) + (canvas_height/2-p.mouseY)*(canvas_height/2-p.mouseY) <= (node_size/2)*(node_size/2)) {
            
            first_generation = 2;
            
            var params_fg = {
                outputMode: 'json',
                start: 'now-1d', // begin time
                end: 'now', // end time
                count: 50, // max items to return
                dedupThreshold: '0.7', // remove duplicates
                rank: 'medium', // level of publisher
                return: 'enriched.url.title,enriched.url.url,enriched.url.enrichedTitle.entities,enriched.url.enrichedTitle.docSentiment'
            }
                
            var qe_date = new Date(document.getElementById("query-year").value, document.getElementById("query-month").value-1, document.getElementById("query-day").value);
                
            var q_dif = Math.floor((Date.now() - qe_date.getTime()) / 86400000);
                
            params_fg['end'] = "now-" + q_dif + "d";
            params_fg['start'] = "now-" + (q_dif+1) + "d";
                
            var newsJSON = alchemy_data_news.getNews(params_fg, function(err, news) {
                if (err) {
                    console.log("Error when getting news: ", err);
                } else {
                    
                    console.log(JSON.stringify(news));
                    
                    entity_hash = {};
                    entities = [];
                    entity_count = [];
                    relevance = [];
                    sentiment = [];
            
                    article_titles = [];
                    article_urls = [];
                    article_sentiments = [];
                
                    if (news.result.docs === undefined) {
                        transition = 1;
                        selected_node = i;
                            
                        return;
                    }
                        
                    for (var nd = 0; nd < news.result.docs.length; nd++) {
                        article_titles[nd] = news.result.docs[nd].source.enriched.url.title;
                        article_urls[nd] = news.result.docs[nd].source.enriched.url.url;
                        article_sentiments[nd] = news.result.docs[nd].source.enriched.url.enrichedTitle.docSentiment.score;
                    
                        for (var ne = 0; ne < news.result.docs[nd].source.enriched.url.enrichedTitle.entities.length; ne++) {
                            var entity_name = news.result.docs[nd].source.enriched.url.enrichedTitle.entities[ne].text;
                        
                            if (entity_hash[entity_name] === undefined) {
                                entity_hash[entity_name] = entities.length;
                                entities[entities.length] = entity_name;
                                entity_count[entities.length-1] = 0;
                                relevance[entities.length-1] = 0;
                                sentiment[entities.length-1] = 0;
                             }
                        
                            var ent_ind = entity_hash[entity_name];
                        
                            entity_count[ent_ind]++;
                            relevance[ent_ind] += news.result.docs[nd].source.enriched.url.enrichedTitle.entities[ne].relevance;
                            sentiment[ent_ind] += news.result.docs[nd].source.enriched.url.enrichedTitle.entities[ne].sentiment.score;
                        }   
                    }
                        
                    transition = 1;
                    selected_node = 0;
            
                    nodes[0].title = "Biggest Topics";
                        
                    return;
                }
            });   
        }
        
        for (var i = 0; i < nodes.length; i++) {
            var tx = canvas_width/2 + edge_length * Math.cos((-i/nodes.length)*(2*Math.PI) + (Math.PI/2));
            var ty = canvas_height/2 + edge_length * Math.sin((-i/nodes.length)*(2*Math.PI) + (Math.PI/2));
            
            if ((tx-p.mouseX)*(tx-p.mouseX) + (ty-p.mouseY)*(ty-p.mouseY) <= (node_size/2)*(node_size/2)) {
                
                first_generation = 1;
                params['q.enriched.url.enrichedTitle.entities.entity.text'] = nodes[i].getTitle();
                params['q.enriched.url.enrichedTitle.keywords.keyword.text'] = nodes[i].getTitle();
                
                var qe_date = new Date(document.getElementById("query-year").value, document.getElementById("query-month").value-1, document.getElementById("query-day").value);
                
                var q_dif = Math.floor((Date.now() - qe_date.getTime()) / 86400000);
                
                params['end'] = "now-" + q_dif + "d";
                params['start'] = "now-" + (q_dif+1) + "d";
                
                var newsJSON = alchemy_data_news.getNews(params, function(err, news) {
                    if (err) {
                        console.log("Error when getting news: ", err);
                    } else {
                        
                        //console.log(news.totalTransactions);
                        //console.log(JSON.stringify(news, null, 2));
                        
                        // ANALYZING JSON
                
                        entity_hash = {};
                        entities = [];
                        entity_count = [];
                        relevance = [];
                        sentiment = [];
                
                        article_titles = [];
                        article_urls = [];
                        article_sentiments = [];
                
                        if (news.result.docs === undefined) {
                            transition = 1;
                            selected_node = i;
                            
                            return;
                        }
                        
                        for (var nd = 0; nd < news.result.docs.length; nd++) {
                            article_titles[nd] = news.result.docs[nd].source.enriched.url.title;
                            article_urls[nd] = news.result.docs[nd].source.enriched.url.url;
                            article_sentiments[nd] = news.result.docs[nd].source.enriched.url.enrichedTitle.docSentiment.score;
                    
                            for (var ne = 0; ne < news.result.docs[nd].source.enriched.url.enrichedTitle.entities.length; ne++) {
                                var entity_name = news.result.docs[nd].source.enriched.url.enrichedTitle.entities[ne].text;
                        
                                if (entity_hash[entity_name] === undefined) {
                                    entity_hash[entity_name] = entities.length;
                                    entities[entities.length] = entity_name;
                                    entity_count[entities.length-1] = 0;
                                    relevance[entities.length-1] = 0;
                                    sentiment[entities.length-1] = 0;
                                }
                        
                                var ent_ind = entity_hash[entity_name];
                        
                                entity_count[ent_ind]++;
                                relevance[ent_ind] += news.result.docs[nd].source.enriched.url.enrichedTitle.entities[ne].relevance;
                                sentiment[ent_ind] += news.result.docs[nd].source.enriched.url.enrichedTitle.entities[ne].sentiment.score;
                            }   
                        }
                        
                        transition = 1;
                        selected_node = i;
                        
                        return;
                    }
                });
                
                return;
            }
        }
    }
};

new P5(s);

// -- end
