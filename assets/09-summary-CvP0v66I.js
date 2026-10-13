var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now hold many values in a list, label facts in a dictionary, nest them into an inventory, repeat work with a for loop and decide with if / elif / else. You combined those ideas to count, collect and flag problems across devices. This page is your revision sheet.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Create a list, read items by index (including -1), and use <code>append</code>, <code>remove</code>, <code>in</code> and <code>len</code>.</li>
<li>Create a dictionary, read, add and change keys, and read safely with <code>get</code>.</li>
<li>Read a nested lookup such as <code>inventory["R1"]["ip"]</code> and add a device entry.</li>
<li>Write a for loop over a list, over <code>range()</code> and over <code>items()</code>.</li>
<li>Write if / elif / else with exact comparisons and with <code>and</code> / <code>or</code>.</li>
<li>Count with a counter, collect with a list and count per group with a dictionary.</li>
<li>Read IndexError, KeyError and IndentationError and fix them.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>List</dt><dd>Ordered values in [ ]; indexes start at 0.</dd>
<dt>Dictionary</dt><dd>Key to value pairs in { }.</dd>
<dt>Index / key</dt><dd>The position in a list / the label in a dictionary.</dd>
<dt>Nested</dt><dd>A container inside another container.</dd>
<dt>Loop</dt><dd>Repeats a block for every item.</dd>
<dt>Condition</dt><dd>An expression that is True or False.</dd>
<dt>Counter</dt><dd>A number that starts at 0 and grows inside a loop.</dd>
<dt>Falsy</dt><dd>Counts as False: empty list, empty string, 0.</dd>
</dl>
<h3>Quick reference</h3>
<table class="cmp"><thead><tr><th>Task</th><th>Code</th></tr></thead><tbody>
<tr><td>First and last item</td><td><code>x[0]</code>   <code>x[-1]</code></td></tr>
<tr><td>Add to a list</td><td><code>x.append(item)</code></td></tr>
<tr><td>Read a key safely</td><td><code>d.get("key", "default")</code></td></tr>
<tr><td>Loop key and value</td><td><code>for k, v in d.items():</code></td></tr>
<tr><td>Loop 1, 2, 3</td><td><code>for n in range(1, 4):</code></td></tr>
<tr><td>Decide</td><td><code>if a == b:  ...  elif ...:  ...  else:</code></td></tr>
<tr><td>Is a list empty?</td><td><code>if x:</code>  or  <code>len(x) &gt; 0</code></td></tr>
<tr><td>Add 1 to a count</td><td><code>count = count + 1</code></td></tr>
</tbody></table>
<h3>Most tested facts</h3>
<ul>
<li>Indexes start at 0; <code>-1</code> is the last item; a slice excludes its end; <code>range(1, 4)</code> is 1, 2, 3.</li>
<li><code>d["missing"]</code> is a KeyError; <code>d.get("missing")</code> returns None.</li>
<li><code>"x" in d</code> tests keys, not values.</li>
<li>A loop body is indented 4 spaces and the line before it ends with a colon.</li>
<li>In if / elif / else the first true branch runs and the rest are skipped.</li>
<li><code>"administratively down" == "down"</code> is False.</li>
</ul>
<p><b>Next:</b> "Python 3" covers functions, so you can name a piece of logic once and reuse it, and the later modules use these same lists and dictionaries when you read JSON from APIs.</p>
<div class="scn"><h4>From spreadsheet to script</h4><p>A junior engineer took the team's inventory, wrote it as a dictionary of dictionaries and added a loop with one if. In an afternoon she produced the list of every core router with its IP address for the change window. Her manager asked for the same report for access switches; she changed one word, <code>"core"</code> to <code>"access"</code>.</p><p><b>Lesson:</b> small, general building blocks are easy to reuse.</p></div>
<div class="iv"><p class="q">"Walk me through a script that reports problems across many devices."</p><p>Store the devices in a list or dictionary, loop over them, connect and collect data, parse it into a dictionary, loop over the parsed fields with an if that tests exactly the failure condition, collect or count the matches, and print a concise report. Mention that the same loop handles any number of devices and that the logic is easy to test on one device first.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lists, dictionaries, loops and decisions are the core of every automation script.</li>
<li>Counting, collecting and per-group counting are the three report patterns.</li>
<li>Exact conditions (down, not administratively down) make useful alerts.</li>
<li>Next: functions in Python 3, then JSON, APIs and tools.</li>
</ul></div>
`,hi:`
<p>Ab aap list mein kai values rakh sakte ho, dictionary mein facts label kar sakte ho, unhe inventory mein nest kar sakte ho, for loop se kaam repeat aur if / elif / else se decide kar sakte ho. In ideas ko jodkar aapne devices par count, collect aur problems flag ki. Yeh page aapki revision sheet hai.</p>
<h3>Can-do checklist</h3>
<ul>
<li>List banao, index (-1 samet) se items padho, aur <code>append</code>, <code>remove</code>, <code>in</code> aur <code>len</code> use karo.</li>
<li>Dictionary banao, keys padho, jodo aur badlo, aur <code>get</code> se safely padho.</li>
<li><code>inventory["R1"]["ip"]</code> jaisa nested lookup padho aur device entry jodo.</li>
<li>List par, <code>range()</code> par aur <code>items()</code> par for loop likho.</li>
<li>Exact comparisons aur <code>and</code> / <code>or</code> ke saath if / elif / else likho.</li>
<li>Counter se count karo, list se collect karo aur dictionary se group-wise count karo.</li>
<li>IndexError, KeyError aur IndentationError padh kar fix karo.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>List</dt><dd>[ ] mein ordered values; index 0 se shuru.</dd>
<dt>Dictionary</dt><dd>{ } mein key se value pairs.</dd>
<dt>Index / key</dt><dd>List mein position / dictionary mein label.</dd>
<dt>Nested</dt><dd>Ek container doosre ke andar.</dd>
<dt>Loop</dt><dd>Block ko har item ke liye repeat karta hai.</dd>
<dt>Condition</dt><dd>Aisi expression jo True ya False hoti hai.</dd>
<dt>Counter</dt><dd>Number jo 0 se shuru hokar loop mein badhta hai.</dd>
<dt>Falsy</dt><dd>False maana jaata hai: khaali list, khaali string, 0.</dd>
</dl>
<h3>Quick reference</h3>
<table class="cmp"><thead><tr><th>Kaam</th><th>Code</th></tr></thead><tbody>
<tr><td>Pehla aur aakhri item</td><td><code>x[0]</code>   <code>x[-1]</code></td></tr>
<tr><td>List mein jodna</td><td><code>x.append(item)</code></td></tr>
<tr><td>Key safely padhna</td><td><code>d.get("key", "default")</code></td></tr>
<tr><td>Key aur value par loop</td><td><code>for k, v in d.items():</code></td></tr>
<tr><td>1, 2, 3 par loop</td><td><code>for n in range(1, 4):</code></td></tr>
<tr><td>Decide karna</td><td><code>if a == b:  ...  elif ...:  ...  else:</code></td></tr>
<tr><td>Kya list khaali hai?</td><td><code>if x:</code>  or  <code>len(x) &gt; 0</code></td></tr>
<tr><td>Count mein 1 jodna</td><td><code>count = count + 1</code></td></tr>
</tbody></table>
<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Indexes 0 se shuru; <code>-1</code> aakhri item; slice ka end shaamil nahi; <code>range(1, 4)</code> 1, 2, 3 hai.</li>
<li><code>d["missing"]</code> KeyError hai; <code>d.get("missing")</code> None return karta hai.</li>
<li><code>"x" in d</code> keys test karta hai, values nahi.</li>
<li>Loop body 4 spaces indent hoti hai aur uske pehle ki line colon par khatam hoti hai.</li>
<li>if / elif / else mein pehli true branch chalti hai aur baaki skip hoti hain.</li>
<li><code>"administratively down" == "down"</code> False hai.</li>
</ul>
<p><b>Aage:</b> "Python 3" functions cover karta hai, taaki aap logic ka ek tukda ek baar naam dekar reuse kar sako, aur baad ke modules JSON padhte waqt yahi lists aur dictionaries use karte hain.</p>
<div class="scn"><h4>Spreadsheet se script tak</h4><p>Ek junior engineer ne team ki inventory li, use dictionary of dictionaries mein likha aur ek if wala loop joda. Ek dopahar mein usne change window ke liye har core router ka IP address ke saath list bana li. Manager ne access switches ke liye wahi report maangi; usne ek word badla, <code>"core"</code> se <code>"access"</code>.</p><p><b>Lesson:</b> chhote, general building blocks reuse karna aasaan hai.</p></div>
<div class="iv"><p class="q">"Ek aisa script samjhao jo kai devices par problems report karta hai."</p><p>Devices ko list ya dictionary mein rakho, un par loop chalao, connect karke data collect karo, use dictionary mein parse karo, parsed fields par loop chalao ek if ke saath jo exactly failure condition test kare, matches collect ya count karo, aur concise report print karo. Bolo ki wahi loop kitne bhi devices sambhalta hai aur logic pehle ek device par test karna aasaan hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lists, dictionaries, loops aur decisions har automation script ka core hain.</li>
<li>Counting, collecting aur group-wise counting teen report patterns hain.</li>
<li>Exact conditions (down, administratively down nahi) kaam ke alerts banati hain.</li>
<li>Aage: Python 3 mein functions, phir JSON, APIs aur tools.</li>
</ul></div>
`}};export{e as default};