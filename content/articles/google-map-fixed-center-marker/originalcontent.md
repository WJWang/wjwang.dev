# Set a fixed center marker in google map

Set a fixed marker in the center of google map can improve mobile user friendly when user have to locate current position.

This solution was adopt by lots of map related applications ex. Uber. However, google map is not support the function natively. When we implement this function, it may not a good idea to calculate the center of the map (that will dynamic change by user activity) all the time, and set marker on it.

We can try another approach. By creating a div cover on the map, and keep it at the center of our map area, and make the div is separate from the map, it won't change position while the map change.

A simple code snippet as follow (A vue component).
