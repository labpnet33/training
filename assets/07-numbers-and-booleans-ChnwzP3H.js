var e={id:`numbers-and-booleans`,h:{en:`Numbers, maths and booleans`,hi:`Numbers, maths aur booleans`},body:{en:`
<p>Networking is full of numbers: VLAN IDs, hop counts, uptime days, a /24 holding 254 hosts. Python can calculate all of them. It can also answer yes/no questions such as "is this VLAN in range?" The yes/no answers are called <b>booleans</b>. They are the doorway to decisions, which you will write in the next module.</p>
<h3>The arithmetic operators</h3>
<table class="cmp"><thead><tr><th>Operator</th><th>Meaning</th><th>Example</th></tr></thead><tbody>
<tr><td><code>+  -  *</code></td><td>add, subtract, multiply</td><td><code>10 * 3</code> is 30</td></tr>
<tr><td><code>/</code></td><td>divide (always gives a float)</td><td><code>7 / 2</code> is 3.5</td></tr>
<tr><td><code>//</code></td><td>whole-number divide</td><td><code>7 // 2</code> is 3</td></tr>
<tr><td><code>%</code></td><td>remainder</td><td><code>7 % 2</code> is 1</td></tr>
<tr><td><code>**</code></td><td>power</td><td><code>2 ** 8</code> is 256</td></tr>
</tbody></table>
<pre class="code">print(10 * 3)
print(7 / 2)
print(7 // 2)
print(7 % 2)
print(2 ** 8)
print(2 ** 8 - 2)
print(int(7 / 2))
print(round(7 / 3, 2))</pre>
<pre class="out">AUTO&gt; python3 n1.py
30
3.5
3
1
256
254
3
2.33</pre>
<p><code>2 ** 8 - 2</code> is 254: a /24 has 8 host bits, so 256 addresses, minus the network and broadcast addresses. Python follows normal maths order: power first, then multiply and divide, then add and subtract; use brackets to be sure.</p>
<p>A small surprise: computers store decimals approximately, so very small errors can appear.</p>
<pre class="code">print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))
print(type(3 / 1))
print(3 + 2.5)</pre>
<pre class="out">AUTO&gt; python3 n2.py
0.30000000000000004
0.3
&lt;class 'float'&gt;
5.5</pre>
<h3>Booleans: True and False</h3>
<p>A boolean has only two possible values, <code>True</code> and <code>False</code> (capital first letter, no quotes). You get them by <b>comparing</b>. A comparison asks a question and returns a boolean.</p>
<table class="cmp"><thead><tr><th>Comparison</th><th>Asks</th></tr></thead><tbody>
<tr><td><code>a == b</code></td><td>Equal? (two equals signs)</td></tr>
<tr><td><code>a != b</code></td><td>Not equal?</td></tr>
<tr><td><code>a &lt; b</code>  <code>a &gt; b</code></td><td>Smaller or bigger?</td></tr>
<tr><td><code>a &lt;= b</code>  <code>a &gt;= b</code></td><td>Smaller or equal, bigger or equal?</td></tr>
<tr><td><code>x in text</code></td><td>Is x inside?</td></tr>
</tbody></table>
<pre class="code">vlan = 10
uptime_days = 42
print(vlan == 10)
print(vlan != 10)
print(uptime_days &gt; 30)
print(1 &lt;= vlan &lt;= 4094)
print("Gi" in "GigabitEthernet0/1")</pre>
<pre class="out">AUTO&gt; python3 n3.py
True
False
True
True
True</pre>
<p>Booleans can be combined with <code>and</code>, <code>or</code> and <code>not</code>. <code>and</code> needs both sides true, <code>or</code> needs at least one, <code>not</code> flips the answer.</p>
<pre class="code">is_core = True
is_old = False
print(is_core and is_old)
print(is_core or is_old)
print(not is_old)
print(3 &gt; 2 and 2 &gt; 5)
print(bool(""), bool("R1"), bool(0), bool(5))</pre>
<pre class="out">AUTO&gt; python3 n4.py
False
True
True
False
False True False True</pre>
<p>The last line shows "truthiness": an empty string and zero count as <code>False</code>; any non-empty text and any non-zero number count as <code>True</code>. Scripts use this to test "did the router return anything?".</p>
<div class="eg"><p><b>Worked example.</b> A VLAN ID is valid when <code>1 &lt;= vlan &lt;= 4094</code>. For 10 the answer is <code>True</code>; for 5000 it is <code>False</code>. In the next module the script will print an error message only when this comparison is <code>False</code>.</p></div>
<div class="warn"><p><b>Common mistake.</b> Writing <code>=</code> when you mean <code>==</code>. <code>vlan = 10</code> stores; <code>vlan == 10</code> asks. Also, <code>"true"</code> in quotes is text, not the boolean <code>True</code>, and <code>/</code> always returns a float: <code>10 / 2</code> is <code>5.0</code>, not <code>5</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know <code>//</code> and <code>%</code>: <code>17 // 5</code> is 3 and <code>17 % 5</code> is 2. Remember that the result of a comparison is a boolean, and that <code>"administratively down" == "down"</code> is <code>False</code> because strings must match exactly.</p></div>
<div class="scn"><h4>The VLAN that was never valid</h4><p>A bulk-config script accepted VLAN 5000 from a spreadsheet and the switch rejected it, leaving a half-built config. After the team added the range comparison <code>1 &lt;= vlan &lt;= 4094</code> as a check, the script stopped before sending anything and printed which row had the problem.</p><p><b>Lesson:</b> validate input with a comparison before you send anything to a device.</p></div>
<div class="iv"><p class="q">"What is a boolean and where do you get one?"</p><p>A boolean is a value that is either <code>True</code> or <code>False</code>. It is the result of a comparison such as <code>==</code>, <code>&gt;</code> or <code>in</code>, and can be combined with <code>and</code>, <code>or</code> and <code>not</code>. Conditions in <code>if</code> statements are booleans.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operators: + - * / // % ** ; / always gives a float.</li>
<li>A comparison (==, !=, &lt;, &gt;, in) returns True or False.</li>
<li>and, or, not combine booleans; empty text and zero count as False.</li>
<li>One = stores a value; two == compares.</li>
</ul></div>
`,hi:`
<p>Networking numbers se bhari hai: VLAN IDs, hop counts, uptime days, /24 mein 254 hosts. Python in sab ki ganana kar sakta hai. Yeh haan/na sawaalon ka jawab bhi de sakta hai, jaise "kya yeh VLAN range mein hai?" Haan/na jawab <b>booleans</b> kehlate hain. Yeh decisions ka darwaza hain, jo aap agle module mein likhoge.</p>
<h3>Arithmetic operators</h3>
<table class="cmp"><thead><tr><th>Operator</th><th>Matlab</th><th>Example</th></tr></thead><tbody>
<tr><td><code>+  -  *</code></td><td>jodna, ghatana, guna</td><td><code>10 * 3</code> is 30</td></tr>
<tr><td><code>/</code></td><td>bhaag (hamesha float deta hai)</td><td><code>7 / 2</code> is 3.5</td></tr>
<tr><td><code>//</code></td><td>poore number ka bhaag</td><td><code>7 // 2</code> is 3</td></tr>
<tr><td><code>%</code></td><td>shesh</td><td><code>7 % 2</code> is 1</td></tr>
<tr><td><code>**</code></td><td>ghaat</td><td><code>2 ** 8</code> is 256</td></tr>
</tbody></table>
<pre class="code">print(10 * 3)
print(7 / 2)
print(7 // 2)
print(7 % 2)
print(2 ** 8)
print(2 ** 8 - 2)
print(int(7 / 2))
print(round(7 / 3, 2))</pre>
<pre class="out">AUTO&gt; python3 n1.py
30
3.5
3
1
256
254
3
2.33</pre>
<p><code>2 ** 8 - 2</code> 254 hai: /24 mein 8 host bits hain, yaani 256 addresses, minus network aur broadcast addresses. Python normal maths ka order follow karta hai: pehle power, phir guna aur bhaag, phir jodna aur ghatana; pakka karne ke liye brackets lagao.</p>
<p>Ek chhota surprise: computers decimals ko approximate store karte hain, isliye bahut chhote errors dikh sakte hain.</p>
<pre class="code">print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))
print(type(3 / 1))
print(3 + 2.5)</pre>
<pre class="out">AUTO&gt; python3 n2.py
0.30000000000000004
0.3
&lt;class 'float'&gt;
5.5</pre>
<h3>Booleans: True aur False</h3>
<p>Boolean ki sirf do possible values hain, <code>True</code> aur <code>False</code> (pehla letter capital, quotes nahi). Aap inhe <b>compare</b> karke paate ho. Comparison sawaal poochta hai aur boolean return karta hai.</p>
<table class="cmp"><thead><tr><th>Comparison</th><th>Poochta hai</th></tr></thead><tbody>
<tr><td><code>a == b</code></td><td>Barabar? (do equals signs)</td></tr>
<tr><td><code>a != b</code></td><td>Barabar nahi?</td></tr>
<tr><td><code>a &lt; b</code>  <code>a &gt; b</code></td><td>Chhota ya bada?</td></tr>
<tr><td><code>a &lt;= b</code>  <code>a &gt;= b</code></td><td>Chhota ya barabar, bada ya barabar?</td></tr>
<tr><td><code>x in text</code></td><td>Kya x andar hai?</td></tr>
</tbody></table>
<pre class="code">vlan = 10
uptime_days = 42
print(vlan == 10)
print(vlan != 10)
print(uptime_days &gt; 30)
print(1 &lt;= vlan &lt;= 4094)
print("Gi" in "GigabitEthernet0/1")</pre>
<pre class="out">AUTO&gt; python3 n3.py
True
False
True
True
True</pre>
<p>Booleans ko <code>and</code>, <code>or</code> aur <code>not</code> se jod sakte ho. <code>and</code> ko dono sides true chahiye, <code>or</code> ko kam se kam ek, <code>not</code> jawab ulta karta hai.</p>
<pre class="code">is_core = True
is_old = False
print(is_core and is_old)
print(is_core or is_old)
print(not is_old)
print(3 &gt; 2 and 2 &gt; 5)
print(bool(""), bool("R1"), bool(0), bool(5))</pre>
<pre class="out">AUTO&gt; python3 n4.py
False
True
True
False
False True False True</pre>
<p>Aakhri line "truthiness" dikhati hai: khaali string aur zero <code>False</code> maane jaate hain; koi bhi non-empty text aur non-zero number <code>True</code>. Scripts ise "kya router ne kuch return kiya?" test karne ke liye use karte hain.</p>
<div class="eg"><p><b>Worked example.</b> VLAN ID tab valid hai jab <code>1 &lt;= vlan &lt;= 4094</code>. 10 ke liye jawab <code>True</code>; 5000 ke liye <code>False</code>. Agle module mein script error message tabhi print karega jab yeh comparison <code>False</code> ho.</p></div>
<div class="warn"><p><b>Common galti.</b> <code>==</code> ki jagah <code>=</code> likhna. <code>vlan = 10</code> store karta hai; <code>vlan == 10</code> poochta hai. Aur quotes mein <code>"true"</code> text hai, boolean <code>True</code> nahi, aur <code>/</code> hamesha float deta hai: <code>10 / 2</code> <code>5.0</code> hai, <code>5</code> nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>//</code> aur <code>%</code> yaad rakho: <code>17 // 5</code> 3 hai aur <code>17 % 5</code> 2. Yaad rakho ki comparison ka result boolean hota hai, aur <code>"administratively down" == "down"</code> <code>False</code> hai kyunki strings exactly match karni padti hain.</p></div>
<div class="scn"><h4>Woh VLAN jo kabhi valid tha hi nahi</h4><p>Ek bulk-config script ne spreadsheet se VLAN 5000 accept kiya aur switch ne reject kar diya, jisse adhoori config bani. Team ne range comparison <code>1 &lt;= vlan &lt;= 4094</code> check ke roop mein jodi to script kuch bhejne se pehle ruk gaya aur bataya kaunsi row mein problem hai.</p><p><b>Lesson:</b> device ko kuch bhejne se pehle comparison se input validate karo.</p></div>
<div class="iv"><p class="q">"Boolean kya hai aur kahan se milta hai?"</p><p>Boolean aisi value hai jo ya <code>True</code> ya <code>False</code> hoti hai. Yeh <code>==</code>, <code>&gt;</code> ya <code>in</code> jaise comparison ka result hai, aur <code>and</code>, <code>or</code>, <code>not</code> se jodi ja sakti hai. <code>if</code> statements ki conditions booleans hoti hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operators: + - * / // % ** ; / hamesha float deta hai.</li>
<li>Comparison (==, !=, &lt;, &gt;, in) True ya False return karta hai.</li>
<li>and, or, not booleans jodte hain; khaali text aur zero False maane jaate hain.</li>
<li>Ek = value store karta hai; do == compare karte hain.</li>
</ul></div>
`}};export{e as default};