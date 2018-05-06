$(document).ready(function() {

    var apiKey = "";
    var clanTag = "";
	var now = new Date();
	var nowTime = (now.getTime() - now.getTimezoneOffset()*60*1000)/1000;
	//var nowTime = Math.floor((new Date()).getTime() / 1000);

	var clanSettings = {
		  "async": true,
		  "crossDomain": true,
		  "url": "https://api.royaleapi.com/clan/",
		  "method": "GET",
		  "headers": {
			"auth": "" //apiKey
		  }
		}
	
	var battleSettings = {
		  "async": true,
		  "crossDomain": true,
		  "url": "https://api.royaleapi.com/player/299LGU988,G0P0YR88/battles",
		  "method": "GET",
		  "headers": {
			"auth": "" //apiKey
		  }
		}
	
    function toggleSidebar() {
        $(".button").toggleClass("active");
        $("main").toggleClass("move-to-left");
        $(".sidebar-item").toggleClass("active");
        $(".sidebar").toggleClass("donotdisplay");
    }

    //
    // Menu Open/Close
    //
    $(".button").on("click tap", function() {
        toggleSidebar();
    });

	//
	//  Updates the leaderboard list HTML
	//
	function updateLeaderboardHTML(rankedList) {

		var html = '';

		for (var i = 0; i < rankedList.length; i++) {

			var tag = rankedList[i].tag;
			var name = rankedList[i].name;
			var lastWarDay = rankedList[i].lastWarDay;
			var lastBattleDay = rankedList[i].lastBattleDay;
			var donations = rankedList[i].donations;
			var received = rankedList[i].donationsReceived;
			
			var consecutiveWin = rankedList[i].consecutiveWin;
			var lv = rankedList[i].expLevel;
			var rank = i + 1;

			var listElement = '<tr><td class="rank">#' + rank + '</td>';
			listElement += '<td class="name"><a href="https://royaleapi.com/player/' + tag + '">' + name + ' (' + lv + ')</a></td>';
			listElement += '<td class="battle">' + lastWarDay + ' days ago <br>' + lastBattleDay + ' days ago</td>';
			listElement += '<td class="battle">' + donations + ' <br>' + received + ' </td>';
			listElement += '<td class="wins">' + consecutiveWin + '</td></tr>';
			html += listElement;
		}

		$("#leaderboard").html(html);
	}

    //
    // Set API Key
    //
    $("#keySubmit").on("click", function() {

		clanSettings.headers.auth = $("#userKey").val();
		battleSettings.headers.auth = $("#userKey").val();
        // Then we remove the input
        $("#enterKey").html('<div class="alert alert-success" role="alert">Successfully saved your API Key. You can set Clan Tag now.</div>');
		  
    });

	
	$("#clanSubmit").on("click", function() {

		$("#leaderboard").html('<tr><td colspan=5>Retriving data from <a>https://royaleapi.com</a>. It may take around 1 minute. <br>Please wait patiently... </td></tr>');
		
		var clanmatesList = [];
		var tagList = [];
		clanSettings.url = "https://api.royaleapi.com/clan/" + $("#userClan").val();
		$.ajax(clanSettings).done(function (clanResponse) {
		  console.log(clanResponse);
		  clanResponse.members.forEach(function (member){
			var tmpMember = {
				'name' : member.name,
				'tag' : member.tag,
				'expLevel': member.expLevel,
				'donations' : member.donations,
				'donationsReceived' : member.donationsReceived,
				'lastWarDay' : 0,
				'lastBattleDay' : 0,
				'consecutiveWin' : 0
			}
			clanmatesList.push(tmpMember);
			tagList.push(member.tag)
		  })
		  battleSettings.url = "https://api.royaleapi.com/player/" + tagList.join() + "/battles";
		  console.log(battleSettings.url);
		  
		  
		  $.ajax(battleSettings).done(function (battleResponse) {
			console.log(battleResponse);
			
			for (var i = 0; i < clanmatesList.length; i++) {
				var lastWarTime = 0;
				var lastBattleTime = 0;
				var consecutiveWin=0;
				var winBreak = false;
			  
				battleResponse[i].forEach(function (battle){
					if (lastBattleTime == 0) {lastBattleTime=battle.utcTime;}
					if (battle.type =="clanWarWarDay"){ 
					if (lastWarTime == 0) {lastWarTime=battle.utcTime;}
					lastWarTime=battle.utcTime;if ((battle.teamCrowns > battle.opponentCrowns)&&(!winBreak)){consecutiveWin++;}else{winBreak=true;}				
					}
				//console.log(Math.floor((nowTime - lastWarTime)/3600/24) + ' days');
				//console.log(consecutiveWin);
				});
				if (lastWarTime > 0 ) {
					clanmatesList[i].lastWarDay = Math.floor((nowTime - lastWarTime)/3600/24);
				} else {
					clanmatesList[i].lastWarDay = "N/A";
				}
				clanmatesList[i].lastBattleDay = Math.floor((nowTime - lastBattleTime)/3600/24);
				clanmatesList[i].consecutiveWin = consecutiveWin;
			}
		  
		  if (clanmatesList.length > 0) {
			updateLeaderboardHTML(clanmatesList);
          }
		  });
		});
		
    });
    
});
