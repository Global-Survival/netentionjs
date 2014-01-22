function startTalk() {

	TogetherJSConfig_on_ready = function () {};
	TogetherJSConfig_toolName = 'Collaboration';
	TogetherJSConfig_getUserName = function () {
		return self.myself().name;
	};
	//TogetherJSConfig_getUserAvatar = function () {return avatarUrl;};

	TogetherJSConfig_dontShowClicks = true;
	TogetherJSConfig_suppressJoinConfirmation = true;
	TogetherJSConfig_suppressInvite = true;

	//TogetherJS.refreshUserData()
	TogetherJS(this);

}

function showAvatarMenu(b) {
    var vm = $('#ViewMenu');
    if (!b) {
        $('#close-menu').hide();
        $('#AvatarButton').hide();
        vm.fadeOut();
        $('#toggle-menu').show();
    }
    else {
        $('#toggle-menu').hide();
        vm.fadeIn();
        $('#close-menu').show();
        $('#AvatarButton').show();
        vm.show();
    }
}

function openSelectProfileModal(title) {
	if (!title) title = 'Profiles';
    //var d = newPopup(title, {width: '450px', modal: true});
	$('#LoadingSplash').show();
	$('#LoadingSplashTitle').html('Authenticated: ' + getCookie('authenticated'));
	$('#LoadingSplashTitle').append(' (<a href="/logout">Logout</a>)');
	$('#AuthSelect').hide();
	$('#ProfileSelect').html(newProfileWidget());
}

$('#SelectProfileButton').click(function() { openSelectProfileModal()  });

$('#ViewMenu input').click(function(x) {
    var b = $(this);
    var v = b.attr('id');
    if ((b.attr('type') === 'text') || (b.attr('type') === 'checkbox'))
        return;
    $('#ViewControls').buttonset('refresh');
    self.save('currentView', v);
    showAvatarMenu(false);
});

$('#ViewMenuExpand').click(function() {
	$('#ViewMenu').toggleClass('ViewMenuExpanded');
});

$('#toggle-menu').click(function() {
    var vm = $('#ViewMenu');
    var shown = vm.is(':visible');
    showAvatarMenu(!shown);
});
$('#close-menu').click(function() {
    var vm = $('#ViewMenu');
    var shown = vm.is(':visible');
    showAvatarMenu(!shown);
});
$('#AvatarButton').click(function() {
    showAvatarMenu(false);
});


$('#AddContentButton').click(function() {
	newPopupObjectEdit( objNew() );
});

$('#FocusButton').click(function() {
    /*
     <div id="Layer" class="ui-widget-header overthrow">
     </div>
     <span>
     <input type="text" placeholder="Filter" disabled/>
     <input type="checkbox" id="GeographicToggle">Exclude Un-Mappable</input>
     </span>                                                        
     */
});

if (configuration.avatarMenuDisplayInitially)
    showAvatarMenu(true);
else
    showAvatarMenu(false);

var focusValue;
function clearFocus() {
    $('#FocusKeywords').val('');
    focusValue = {tags: [], when: null, where: null};
}
clearFocus();

function renderFocus() {
    self.setFocus(focusValue);

    var fe = $('#FocusEdit');
    fe.html('');
    var noe = newObjectEdit(focusValue, true, true, function(xx) {
        focusValue = xx;
        renderFocus();
    }, function(x) {
        focusValue = x;
        self.setFocus(x);
    }, [ 'spacepoint' ]); //do not show spacepoint property, custom renderer is below

    fe.append(noe);

	if ((configuration.avatarMenuTagTreeAlways) || (focusValue.what)) {
		var tt = newFocusTagTree(focusValue, function(tag, newStrength) {
			console.log(tag, newStrength);
			var tags = objTags(focusValue);
			var existingIndex = _.indexOf(tags, tag);

			if (existingIndex!=-1)
				objRemoveValue(focusValue, existingIndex);

			if (newStrength > 0) {
	            objAddTag(focusValue, tag, newStrength);
			}

		    renderFocus();
		});
		tt.attr('style', 'height: ' + Math.floor($(window).height()*0.4) + 'px !important' );
		fe.append(tt);
	}
    if (focusValue.when) {
    }

	var where = objSpacePointLatLng(focusValue);
    if (where) {
        var uu = uuid();
        var m = newDiv(uu);
        m.attr('style', 'height: 250px; width: 95%');	//TODO use css
        fe.append(m);
        var lmap = initLocationChooserMap(uu, where, 3);
		lmap.onClicked = function(l) {
			objSetFirstValue(focusValue, 'spacepoint', { lat: l.lat, lon: l.lon, planet: 'Earth'});
			self.setFocus(focusValue);
		};
    }
}

$('#FocusWhereButton').click(function() {
    if (!objSpacePointLatLng(focusValue)) {
        /*focusValue.where = _.clone(objSpacePoint(self.myself()) || 
			{lat: configuration.mapDefaultLocation[0] , lon: configuration.mapDefaultLocation[0], planet: 'Earth'});*/
		objSetFirstValue(focusValue, 'spacepoint', { lat: configuration.mapDefaultLocation[0], lon: configuration.mapDefaultLocation[1], planet: 'Earth'});
        renderFocus();
    }
    else {
        if (confirm("Remove focus's 'Where'?")) {
			var tags = objTags(focusValue, true);
			var spi = _.indexOf(tags, 'spacepoint');
			if (spi!=-1)
				objRemoveValue(focusValue, spi);
            renderFocus();
        }
    }
});

var periodMS = FOCUS_KEYWORD_UPDATE_PERIOD;
var ty = _.throttle(function() {
    var t = $('#FocusKeywords').val();
    focusValue.name = t;
    self.setFocus(focusValue);
}, periodMS);

$('#FocusKeywords').keyup(
        function() {
            ty();
        }
);


$('#FocusClearButton').click(function() {
    clearFocus();
    renderFocus();
});

$('#FocusWhatButton').click(function() {
	focusValue.what = !focusValue.what;
    renderFocus();
});
$('#FocusWhenButton').click(function() {
    objAddValue(focusValue, {id: 'timerange', value: {from: 0, to: 0}});
    renderFocus();
});

//TODO ABSTRACT this into a pluggable focus template system

$('#FocusNeedButton').click(function() {
    /*var needs = ['Volunteer', 'Shelter', 'Food', 'Tools', 'Health', 'Transport', 'Service', 'Animal'];
	//TODO select child tags of 'Support' (their parent tag) to avoid hardcoding it here
    _.each(needs, function(n) {
        objAddValue(focusValue, {id: n});
    });
    renderFocus();*/
    var d = newPopup("Add Tag to Focus", {width: 800, height: 600, modal: true, position: 'center'});
    d.append(newTagger([], function(x) {
        for (var i = 0; i < x.length; i++)
            objAddTag(focusValue, x[i]);

        renderFocus();
        d.dialog('close');
    }));

});

if (configuration.avatarMenuTagTreeAlways) {
	$('#FocusWhatButton').hide();
	renderFocus();	//force a render
}

