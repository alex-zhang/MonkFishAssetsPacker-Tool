var curScriptURL = fl.scriptURI;
var curDirURL = curScriptURL.substring(0, curScriptURL.lastIndexOf("/") + 1);
var curFlaURL = curDirURL + "../art/spritesheet.fla";
var curDoc = fl.openDocument(curFlaURL);
var curDom = fl.getDocumentDOM();
curDom.library.editItem("spritesheet");
var spritesheetMCTimeLine = fl.getDocumentDOM().getTimeline();

var animationMetadata = {};//key : value
var animationInfos = [];//{name->[startFrame-endFrame]}
var spritesheetMCTimeLineLeftBounds = 0;
var spritesheetMCTimeLineTopBounds = 0;
var spritesheetMCTimeLineRightBounds = 0;
var spritesheetMCTimeLineBottomBounds = 0;
var spritesheetMCTimeLineBoundsInited = false;

//excute flows.
//1.
parseSpritesheetMCTimeLineBounds(spritesheetMCTimeLine);
//2.
parseSpritesheetMCLayers(spritesheetMCTimeLine.layers);
//3.
outputAnimationSetInfo();

curDoc.save();
fl.closeDocument(curDoc);

//---------------------------------------------------------------
function parseSpritesheetMCTimeLineBounds(spritesheetMCTimeLine)
{
	var frameCount = spritesheetMCTimeLine.frameCount;

	for(var frameIndex = 0; frameIndex < frameCount; frameIndex++)
	{
		spritesheetMCTimeLine.currentFrame = frameIndex;
		curDom.selectAll();

		var selectedElements = curDom.selection;
		var elementX = 0;
		var elementY = 0;
		var elementW = 0;
		var elementH = 0;

		for each(var element in selectedElements)
		{
			elementX = Math.round(element.left);
			elementY = Math.round(element.top);
			elementW = Math.round(element.width);
			elementH = Math.round(element.height);

			if(!spritesheetMCTimeLineBoundsInited)
			{
				spritesheetMCTimeLineLeftBounds = elementX;
				spritesheetMCTimeLineTopBounds = elementY;

				spritesheetMCTimeLineRightBounds = elementX + elementW;
				spritesheetMCTimeLineBottomBounds = elementY + elementH;

				spritesheetMCTimeLineBoundsInited = true;
			}
			else
			{
				spritesheetMCTimeLineLeftBounds = Math.min(spritesheetMCTimeLineLeftBounds, elementX);
				spritesheetMCTimeLineTopBounds = Math.min(spritesheetMCTimeLineTopBounds, elementY);

				spritesheetMCTimeLineRightBounds = Math.max(spritesheetMCTimeLineRightBounds, elementX + elementW);
				spritesheetMCTimeLineBottomBounds = Math.max(spritesheetMCTimeLineBottomBounds, elementY + elementH);
			}
		}
	}
}

//out put animation
function outputAnimationSetInfo()
{
	var curAnimationSetURL = curDirURL + "../packDir/aniSet.xml";

	var outputXMLStr = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "\n" +
						"<AnimationSet pivotX=\"" + (-spritesheetMCTimeLineLeftBounds) + "\"" + " " +
									  "pivotY=\"" + (-spritesheetMCTimeLineTopBounds) + "\"" + " " +
									  "width=\"" + (spritesheetMCTimeLineRightBounds - spritesheetMCTimeLineLeftBounds) + "\"" + " " +
									  "height=\"" + (spritesheetMCTimeLineBottomBounds - spritesheetMCTimeLineTopBounds) + "\"" + " " +
									  ">" + "\n" + 
							"    <Metadata>" + "\n" + 
							getAnimationMetadataXMLStr() + 
							"    </Metadata>" + "\n" +

							getAnimationsStr() + "\n" +
						"</AnimationSet>";

	FLfile.write(curAnimationSetURL, outputXMLStr);
}

//------------------------------------------------------
function getAnimationMetadataXMLStr()
{
	var result = "";

	for(var key in animationMetadata)
	{

		result += "        " + "<" + key + ">" + animationMetadata[key] + "</" + key + ">" + "\n";
	}

	return result;
}

function getAnimationsStr()
{
	var result = "";
	var n = animationInfos.length;

	var animationInfo;

	for(var i = 0; i < n; i++)
	{
		animationInfo = animationInfos[i];

		result += getAnimationStr(animationInfo);
		result += (i < n - 1) ? "\n" : ""
	}

	return result;
}

function getAnimationStr(animationInfo)
{
	var name = animationInfo.name;
	var frameRate = animationInfo.frameRate;
	var events = animationInfo.events;
	var startIndex = animationInfo.startIndex;
	var endIndex = animationInfo.endIndex;

	//fl.trace("events" + events.length);

	var aniamtionFramesStr = "";

	for(var i = startIndex; i <= endIndex; i++)
	{
		var textureName = "spritesheet" + fillNumWithZero(i);

		var eventObj = findEventObjecByFrameIndex(i, events);
		
		var eventTag = "";
		if(eventObj !== undefined)
		{
			var eventName = eventObj.name;
			if(eventName != "")
			{
				eventTag += " event=\"" + eventName + "\"" + " ";

				//var eventParams = "";
				if("params" in eventObj)
				{
					var eventParamsStr = convertObjectToInLineString(eventObj.params);
					if(eventParamsStr != "")
					{
						eventTag += "eventParams=\"" + eventParamsStr + "\"" + " ";
					}
				}
			}
		}

		aniamtionFramesStr += "        <Frame" + " " + 
		//"frame=\"" + (i + 1) + "\"" + " " +
		"textureName=\"" + textureName + "\"" + eventTag  +"/>";
		aniamtionFramesStr += (i < endIndex) ? "\n" : "";
	}

	var result = "    <Animation name=" + "\"" + name + "\"" + " " +
				 "frameRate=" + "\"" + frameRate + "\"" + ">" + "\n" +
				 aniamtionFramesStr + "\n" +
	 			"    </Animation>";

	return result;
}

function findEventObjecByFrameIndex(frameIndex, events)
{
	var eventCount = events.length;
	var event;
	var eventName;
	var eventParamsStr;
	var eventFrameIndex;

	for(var i = 0; i < eventCount; i++)
	{
		event = events[i];
		eventName = event.name;
		eventFrameIndex = event.frameIndex;

		//fl.trace("->" + eventName + " " + eventFrameIndex);

		if(eventFrameIndex == frameIndex) 
		{
			var result = 
			{
				name:eventName
			};

			if("params" in event)
			{
				result.params = event.params;
			}

			return result;
		}
	}

	return undefined;
}

//------------------------------------------------------

function fillNumWithZero(num)
{
	var numStr = num.toString();
	var n = numStr.length;
	while(n < 4)
	{
		numStr = "0" + numStr;
		n++;
	}

	return numStr;
}

function parseSpritesheetMCLayers(layers)
{
	var layerCount = layers.length;
	var layer;
	var layerName;
	var layerFrames;
	var animationInfo;

	for(var layerIndex = 0; layerIndex < layerCount; layerIndex++)
	{
		layer = layers[layerIndex];
		layerName = layer.name;
		layerFrames = layer.frames;

		if(layerName == "@metadata")
		{
			parseSpritesheetMCAnimatonMetadata(layerFrames);
		}
		else
		{
			animationInfo = {};
			animationInfos.push(animationInfo);

			animationInfo.name = layerName;
			animationInfo.startIndex = 0;
			animationInfo.endIndex = 0;
			animationInfo.frameRate = curDom.frameRate;//default the Doc frameRate.
			animationInfo.events = [];//{name:frame.name, frameIndex:layerFrameIndex}

			parseSpritesheetMCAnimatonFrames(layerFrames, animationInfo);
		}		
	}
}

function parseSpritesheetMCAnimatonMetadata(layerFrames)
{
	var layerFrameCount = layerFrames.length;
	if(layerFrameCount > 0)
	{
		var frame = layerFrames[0];

		var frameASStr = frame.actionScript;

		if(frameASStr != "")
		{
			var frameASOb = convertMutiLineStringToObject(frame.actionScript);
			animationMetadata = frameASOb;
		}
	}
}

function parseSpritesheetMCAnimatonFrames(layerFrames, animationInfo)
{
	var layerFrameCount = layerFrames.length;
	var hasParseFirstNotEmptyKeyFrame = false;
	var frameASOb;
	var frameASStr;
	for(var layerFrameIndex = 0; layerFrameIndex < layerFrameCount; layerFrameIndex++)
	{
		var frame = layerFrames[layerFrameIndex];

		//first aniamtion key frame AS config.
		if(!hasParseFirstNotEmptyKeyFrame)
		{
			if(frame.elements.length > 0)//the first key frame. so the animation layer's first frame should not empty.
			{
				animationInfo.startIndex = layerFrameIndex;
				
				animationInfo.endIndex = layerFrameCount - 1;

				frameASStr = frame.actionScript;

				//only frameRate read.
				if(frameASStr != "")
				{
					frameASOb = convertMutiLineStringToObject(frameASStr);
					if("frameRate" in frameASOb)
					{
						animationInfo.frameRate = parseInt(frameASOb.frameRate);
						//fl.trace("------------------------------ " + frameASStr);
						//delete frameASOb.frameRate;
					}
				}

				hasParseFirstNotEmptyKeyFrame = true;
			}
		}

		//aniamtion event frame
		if(frame.startFrame == layerFrameIndex)//key frame
		{
			if(frame.name != "")
			{
				frameASStr = frame.actionScript;

				//event object.
				if(frameASStr != "")
				{
					frameASOb = convertMutiLineStringToObject(frameASStr);
					//we don't need the frameRate property for event.
					if("frameRate" in frameASOb)
					{
						delete frameASOb.frameRate;
					}

					animationInfo.events.push(
						{
							name:frame.name, 
							params:frameASOb,
							frameIndex:layerFrameIndex
						}
					);
				}
				else
				{
					animationInfo.events.push(
						{
							name:frame.name, 
							frameIndex:layerFrameIndex
						}
					);
				}
				
				//fl.trace("->" + layerFrameIndex);
			}
		}
	}
}

//read the AS Content Chars and conver to Object.
//key:value\n
//key:value
//...
function convertMutiLineStringToObject(actionScriptChars)
{
	var result = {};

	var itemsStrArr = actionScriptChars.split("\n");
	var n = itemsStrArr.length;
	for(var i = 0; i < n; i++)
	{
		var itemStr = itemsStrArr[i];

		if(itemStr.indexOf(":") != -1)
		{
			var itemArr = itemStr.split(":");

			result[itemArr[0]] = itemArr[1];
			//fl.trace("-->" + itemArr[0] + " " + itemArr[1]);
		}
	}

	return result;
}

//key:value;key:value;
function convertObjectToInLineString(obj)
{
	var results = "";
	var hasKey = false;
	for(key in obj)
	{
		results += key + ":" + obj[key] + ";";
		hasKey = true;
	}

	if(hasKey)
	{
		return results.substr(0, results.length - 1);
	}

	return "";
}