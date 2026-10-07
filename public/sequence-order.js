'use strict';
if(window.course.panelOrder){const parent=document.getElementById('experiences');for(const id of window.course.panelOrder){const node=document.getElementById(id);if(node)parent.append(node)}const intro=parent.querySelector('.bench-intro');if(intro){const first=parent.querySelector('.instrument-panel');if(first)parent.insertBefore(intro,first)}}
