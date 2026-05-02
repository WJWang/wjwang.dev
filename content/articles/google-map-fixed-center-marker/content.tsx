import {
  Prose,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        Set a fixed marker in the center of google map can improve mobile user friendly when user have to locate current position.
      </p>

      <p>
        This solution was adopt by lots of map related applications ex. Uber. However, google map is not support the function natively. When we implement this function, it may not a good idea to calculate the center of the map (that will dynamic change by user activity) all the time, and set marker on it.
      </p>

      <p>
        We can try another approach. By creating a div cover on the map, and keep it at the center of our map area, and make the div is separate from the map, it won't change position while the map change.
      </p>

      <p>
        A simple code snippet as follow (A vue component).
      </p>

      <p>原文發表於 <a href="https://wjwang.medium.com/set-a-fixed-center-marker-in-google-map-372197fe731a">Medium</a></p>
    </Prose>
  );
}
