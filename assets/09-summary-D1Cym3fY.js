var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now display text, store values, tell text from numbers, clean strings, build configuration with f-strings, compare values and read the three most common errors. These are the foundation of every automation script. This page is your revision sheet.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Print text, numbers and several values with <code>print()</code>.</li>
<li>Write a comment and use it to switch a line off.</li>
<li>Create and change variables; follow the naming rules.</li>
<li>Say whether a value is str, int, float or bool, and convert with <code>int()</code> and <code>str()</code>.</li>
<li>Clean text with strip, upper, lower and replace; cut it with split.</li>
<li>Build config lines with an f-string, including formats such as <code>:03d</code>.</li>
<li>Use arithmetic and comparisons, and predict True or False.</li>
<li>Fix a SyntaxError, a NameError and a TypeError from the message.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Variable</dt><dd>A name bound to a value.</dd>
<dt>str / int / float / bool</dt><dd>Text / whole number / decimal / True-False.</dd>
<dt>Method</dt><dd>An action on a value: value.method().</dd>
<dt>f-string</dt><dd>A string starting with f whose braces are filled with values.</dd>
<dt>Comment</dt><dd>A note after #, ignored by Python.</dd>
<dt>Boolean</dt><dd>True or False, the result of a comparison.</dd>
<dt>Traceback</dt><dd>The report Python prints when a script fails.</dd>
<dt>Concatenate</dt><dd>Join two strings end to end.</dd>
</dl>
<h3>Quick reference</h3>
<table class="cmp"><thead><tr><th>Idea</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>Show text</td><td><code>print("R1", 10)</code></td><td><code>R1 10</code></td></tr>
<tr><td>Variable</td><td><code>vlan = 10</code></td><td>stores 10</td></tr>
<tr><td>Type</td><td><code>type("10")</code></td><td><code>&lt;class 'str'&gt;</code></td></tr>
<tr><td>Convert</td><td><code>int("10") + 5</code></td><td><code>15</code></td></tr>
<tr><td>Clean</td><td><code>"  pune ".strip().upper()</code></td><td><code>PUNE</code></td></tr>
<tr><td>Cut</td><td><code>"a b".split()</code></td><td><code>['a', 'b']</code></td></tr>
<tr><td>f-string</td><td><code>f"vlan {vlan}"</code></td><td><code>vlan 10</code></td></tr>
<tr><td>Compare</td><td><code>10 == 10</code></td><td><code>True</code></td></tr>
</tbody></table>
<h3>Most tested facts</h3>
<ul>
<li>Quotes make text: <code>"10" + "5"</code> is <code>105</code>; <code>10 + 5</code> is <code>15</code>.</li>
<li>String methods return a new string; they do not change the original.</li>
<li>Counting starts at 0; <code>[0:3]</code> excludes position 3.</li>
<li>Without the f, an f-string is plain text and the braces print as typed.</li>
<li><code>=</code> stores, <code>==</code> compares; <code>/</code> always returns a float.</li>
<li>SyntaxError appears before the script runs; NameError means an unknown name; TypeError means a wrong type.</li>
</ul>
<p><b>Next:</b> "Python 2" teaches lists, dictionaries, for loops and if/else decisions, so your scripts can handle many devices and choose what to do.</p>
<div class="scn"><h4>Ready for devices</h4><p>A trainee finished these chapters and wrote a ten-line script that built the configuration for a new access port from five variables. The senior reviewed the five variables, not the ten lines of output, and approved it. A week later the trainee extended it to loop over twenty ports, using lists from the next module.</p><p><b>Lesson:</b> variables plus f-strings are the base on which loops and lists build.</p></div>
<div class="iv"><p class="q">"Give an example of Python that a network engineer might write in the first week."</p><p>A small script that stores an interface name, a VLAN and a site in variables and prints the matching configuration lines with an f-string. It shows you understand variables, strings and formatting, and it is genuinely useful because it removes copy-paste errors.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Variables, types, string methods and f-strings build config text.</li>
<li>Comparisons give booleans, the basis of decisions.</li>
<li>Read errors from the last line and fix one thing at a time.</li>
<li>Next: lists, dictionaries, loops and if/else in Python 2.</li>
</ul></div>
`,hi:`
<p>Ab aap text dikha sakte ho, values store kar sakte ho, text aur numbers ka fark pehchaan sakte ho, strings saaf kar sakte ho, f-strings se configuration bana sakte ho, values compare kar sakte ho aur teen sabse common errors padh sakte ho. Yeh har automation script ki neev hai. Yeh page aapki revision sheet hai.</p>
<h3>Can-do checklist</h3>
<ul>
<li><code>print()</code> se text, numbers aur kai values print kar sako.</li>
<li>Comment likh sako aur use line band karne ke liye use kar sako.</li>
<li>Variables bana aur badal sako; naming rules follow kar sako.</li>
<li>Bata sako ki value str, int, float ya bool hai, aur <code>int()</code> aur <code>str()</code> se convert kar sako.</li>
<li>strip, upper, lower aur replace se text saaf aur split se kaat sako.</li>
<li><code>:03d</code> jaise formats ke saath f-string se config lines bana sako.</li>
<li>Arithmetic aur comparisons use kar sako, aur True ya False predict kar sako.</li>
<li>Message se SyntaxError, NameError aur TypeError fix kar sako.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Variable</dt><dd>Value se bandha naam.</dd>
<dt>str / int / float / bool</dt><dd>Text / poora number / decimal / True-False.</dd>
<dt>Method</dt><dd>Value par action: value.method().</dd>
<dt>f-string</dt><dd>f se shuru hone wali string jiske braces values se bharte hain.</dd>
<dt>Comment</dt><dd># ke baad ka note, Python ignore karta hai.</dd>
<dt>Boolean</dt><dd>True ya False, comparison ka result.</dd>
<dt>Traceback</dt><dd>Script fail hone par Python jo report print karta hai.</dd>
<dt>Concatenate</dt><dd>Do strings ko end-to-end jodna.</dd>
</dl>
<h3>Quick reference</h3>
<table class="cmp"><thead><tr><th>Idea</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>Text dikhana</td><td><code>print("R1", 10)</code></td><td><code>R1 10</code></td></tr>
<tr><td>Variable</td><td><code>vlan = 10</code></td><td>10 store hota hai</td></tr>
<tr><td>Type</td><td><code>type("10")</code></td><td><code>&lt;class 'str'&gt;</code></td></tr>
<tr><td>Convert</td><td><code>int("10") + 5</code></td><td><code>15</code></td></tr>
<tr><td>Saaf karna</td><td><code>"  pune ".strip().upper()</code></td><td><code>PUNE</code></td></tr>
<tr><td>Kaatna</td><td><code>"a b".split()</code></td><td><code>['a', 'b']</code></td></tr>
<tr><td>f-string</td><td><code>f"vlan {vlan}"</code></td><td><code>vlan 10</code></td></tr>
<tr><td>Compare</td><td><code>10 == 10</code></td><td><code>True</code></td></tr>
</tbody></table>
<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Quotes text banate hain: <code>"10" + "5"</code> <code>105</code> hai; <code>10 + 5</code> <code>15</code>.</li>
<li>String methods nayi string return karte hain; original nahi badalte.</li>
<li>Ginti 0 se shuru; <code>[0:3]</code> mein position 3 shaamil nahi.</li>
<li>f ke bina f-string plain text hai aur braces waise hi print hote hain.</li>
<li><code>=</code> store karta hai, <code>==</code> compare; <code>/</code> hamesha float deta hai.</li>
<li>SyntaxError script chalne se pehle aata hai; NameError anjaana naam; TypeError galat type.</li>
</ul>
<p><b>Aage:</b> "Python 2" lists, dictionaries, for loops aur if/else decisions sikhata hai, taaki aapke scripts kai devices sambhal sakein aur decide kar sakein kya karna hai.</p>
<div class="scn"><h4>Devices ke liye taiyaar</h4><p>Ek trainee ne yeh chapters khatam karke das lines ka script likha jo paanch variables se naye access port ki configuration banata tha. Senior ne das lines ke output ki jagah paanch variables review kiye aur approve kar diya. Ek hafte baad trainee ne ise bees ports par loop karne wala bana diya, agle module ki lists use karke.</p><p><b>Lesson:</b> variables aur f-strings woh base hain jis par loops aur lists bante hain.</p></div>
<div class="iv"><p class="q">"Network engineer pehle hafte mein kaunsa Python likh sakta hai, ek example do."</p><p>Chhota script jo interface name, VLAN aur site ko variables mein rakhta hai aur f-string se matching configuration lines print karta hai. Yeh dikhata hai ki aap variables, strings aur formatting samajhte ho, aur yeh kaam ka bhi hai kyunki copy-paste ki galtiyan hataata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Variables, types, string methods aur f-strings config text banate hain.</li>
<li>Comparisons booleans dete hain, jo decisions ka base hain.</li>
<li>Errors aakhri line se padho aur ek ek cheez fix karo.</li>
<li>Aage: Python 2 mein lists, dictionaries, loops aur if/else.</li>
</ul></div>
`}};export{e as default};