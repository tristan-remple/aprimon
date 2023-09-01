<?php

// var_dump($_POST);

include('../data/pkmn.php');

$user = $_POST['in-user'];
if (hash($algo, $_POST['in-password']) === $users[$user]) {
    $aprimon = fopen("data/".$user.".json", "w") or die("Unable to open file!");
    fwrite($aprimon, $_POST['in-json']);
    fclose($aprimon);

    $tallies = fopen("data/".$user.".html", "w") or die("Unable to open file!");

    $html = '<tr>
    <td id="since" class="num">'.$_POST['in-since-last'].'</td>
    <td class="label">Eggs since last shiny</td>
    </tr>
    <tr>
    <td id="queue" class="num" data-pkmn="'.$_POST['in-queue-pokemon'].'">'.$_POST['in-queue-eggs'].'</td>
    <td class="label">Queue</td>
    </tr>';

    fwrite($tallies, $html);
    fclose($tallies);

    header("Location: index.html");
} else {
    echo "Invalid password";
}



?>