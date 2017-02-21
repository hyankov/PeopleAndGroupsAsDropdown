jQuery.fn.outerHTML = function (s) {
	return s
		? this.before(s).remove()
		: jQuery("<p>").append(this.eq(0).clone()).html();
};

var Fields_Renderer = Fields_Renderer || {};

Fields_Renderer.FieldName = "GroupsAsDropdownTest";

// Define the allowed options (groups)
Fields_Renderer.DropdownOptions = [
		{
			Group: "Hierarchy Managers",
			DisplayName: "Hierarchy Managers - Display Name"
		},
		{
			Group: "Restricted Readers",
			DisplayName: "Restricted Readers - You can change this"
		},
		{
			Group: "Translation Managers",
			DisplayName: "Translation Managers - To whatever you want"
		}
];

Fields_Renderer.Edit = function (ctx) {
	var currentValue = "";
	if (ctx.CurrentFieldValue.length > 0) {
		currentValue = ctx.CurrentFieldValue[0].Key;
	}
	
	var dropdownHTML = "<select onChange='Fields_Renderer.SelectionChange(this);'>";
		dropdownHTML += "<option value=''>- Please select -</option>";
	jQuery.each(Fields_Renderer.DropdownOptions, function (idx, option) {
		dropdownHTML += "<option value='" + option.Group + "' " + (currentValue == option.Group ? 'selected' : '') + ">" + option.DisplayName + "</option>";
	});
	dropdownHTML += "</select>";

	var html = jQuery(SPClientPeoplePickerCSRTemplate(ctx));
	html.hide();

	return html.outerHTML() + dropdownHTML;
};

Fields_Renderer.SelectionChange = function (select) {
	var drop = jQuery(select);
	var pickerId = drop.parent().find(".sp-peoplepicker-topLevel").attr("id");
	var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[pickerId];

	// Remove current group(s)
	if (!peoplePicker.IsEmpty()) {
		jQuery("[id = '" + peoplePicker.ResolvedListElementId + "']").children().each(function (index, element) {
			element = jQuery(element);
			if (element.attr("id").indexOf("_ProcessedUser") > -1) {
				peoplePicker.DeleteProcessedUser(element[0]);
			}
		});
	}

	// Enter new value
	var newVal = drop.find("option:selected").val();
	if (newVal != "") {
		var usrObj = { 'Key': newVal };
		peoplePicker.AddUnresolvedUser(usrObj, true);
	}
};

Fields_Renderer.Display = function (fieldCtx, fieldInfo) {
	var displayValue = "";
	var currentValue = "";
	 
	if (fieldCtx.CurrentFieldValue != null) {
		currentValue = fieldCtx.CurrentFieldValue.split(',')[0].split(";#")[1];
	} else {
		if (fieldCtx.CurrentItem[Fields_Renderer.FieldName].length > 0) {
			currentValue = fieldCtx.CurrentItem[Fields_Renderer.FieldName][0].title;
		}
	}

	if (currentValue != "") {
		jQuery.each(Fields_Renderer.DropdownOptions, function (idx, option) {
			if (currentValue == option.Group) {
				displayValue = option.DisplayName;
				return false;
			}
		});
	}

	return "<span>" + displayValue + "</span>";
};

(function () {
	var FieldCtx = {};
	FieldCtx.Templates = {};
	FieldCtx.Templates.Fields = {
		'GroupsAsDropdownTest': {
			'View': Fields_Renderer.Display,
			'NewForm': Fields_Renderer.Edit,
			'EditForm': Fields_Renderer.Edit,
			'DisplayForm': Fields_Renderer.Display,
			'Item': Fields_Renderer.Display
		}
	};
	
	SPClientTemplates.TemplateManager.RegisterTemplateOverrides(FieldCtx);
})();