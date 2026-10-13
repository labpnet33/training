var e={id:`f-strings`,h:{en:`f-strings: the easiest way to build config lines`,hi:`f-strings: config lines banane ka sabse aasaan tareeka`},body:{en:`
<p>You can already join text with <code>+</code> and convert numbers with <code>str()</code>. It works, but it is clumsy: <code>"interface " + name + " vlan " + str(vlan)</code> is easy to mistype. Python has a much nicer tool, the <b>f-string</b> (formatted string literal). It is a template with blanks. Put the letter <code>f</code> directly before the opening quote, and write <code>{name}</code> wherever you want a variable's value to appear.</p>
<pre class="code">interface = "GigabitEthernet0/2"
vlan = 20
site = "PUNE"
print(f"interface {interface}")
print(f" description Link to {site} - VLAN {vlan}")
print(f" switchport access vlan {vlan}")
print(f" ip address 10.1.{vlan}.1 255.255.255.0")</pre>
<pre class="out">AUTO&gt; python3 f1.py
interface GigabitEthernet0/2
 description Link to PUNE - VLAN 20
 switchport access vlan 20
 ip address 10.1.20.1 255.255.255.0</pre>
<p>The output is configuration that you can paste straight into a switch. Three details matter:</p>
<ul>
<li>The <code>f</code> must be <b>directly</b> before the quote, with no space.</li>
<li>Numbers need no <code>str()</code>; the f-string converts them for you.</li>
<li>Inside the braces you may put a calculation or a method: <code>{site.lower()}</code>, <code>{vlan + 100}</code>.</li>
</ul>
<pre class="code">site = "PUNE"
vlan = 20
print(f"{site.lower()}-sw-{vlan + 100}")</pre>
<pre class="out">AUTO&gt; python3 f2.py
pune-sw-120</pre>
<h3>Formatting numbers</h3>
<p>After the value you may add a colon and a format. <code>{n:03d}</code> pads a whole number with zeros to three digits; <code>{x:.2f}</code> shows two decimals; <code>{text:>8}</code> right-aligns text in 8 characters. Useful for neat, equal-width names like <code>SW-007</code>.</p>
<pre class="code">n = 7
print(f"SW-{n:03d}")
print(f"{3.14159:.2f}")
print(f"[{'Gi0/1':&gt;8}]")</pre>
<pre class="out">AUTO&gt; python3 f3.py
SW-007
3.14
[   Gi0/1]</pre>
<h3>Two traps: the missing f and literal braces</h3>
<p>Forget the <code>f</code> and Python prints the braces exactly as typed. If you want real braces in the output, double them:</p>
<pre class="code">vlan = 10
print("vlan {vlan}")
print(f"vlan {vlan}")
print(f"{{vlan}} is {vlan}")</pre>
<pre class="out">AUTO&gt; python3 f4.py
vlan {vlan}
vlan 10
{vlan} is 10</pre>
<h3>Lab 1 walk-through</h3>
<p>In the lab you run <code>hello_router.py</code>, change two variables and add one line. Here are the lines with their numbers, so you know which line to edit:</p>
<pre class="out">AUTO&gt; nl hello_router.py
     1  # hello_router.py - build interface config lines with Python
     2  # A VARIABLE is a named box that stores a value.
     3  interface = "GigabitEthernet0/1"   # a string (text): always inside quotes
     4  vlan = 10                          # an integer (whole number): no quotes
     5  site = "  pune  "                  # messy text with extra spaces
     6  
     7  # print() shows something on the screen
     8  print("Building config...")
     9  
    10  # .strip() removes spaces at both ends, .upper() makes CAPITAL letters
    11  clean_site = site.strip().upper()
    12  
    13  # f-string: put f before the quote, then {name} is replaced by its value
    14  print(f"interface {interface}")
    15  print(f" description Link to {clean_site} - VLAN {vlan}")
    16  print(" switchport mode access")
    17  print(f" switchport access vlan {vlan}")</pre>
<p>First run with the original values, then change the port and the VLAN (lines 3 and 4 only), and run again:</p>
<pre class="out">AUTO&gt; python3 hello_router.py
Building config...
interface GigabitEthernet0/1
 description Link to PUNE - VLAN 10
 switchport mode access
 switchport access vlan 10</pre>
<pre class="out">AUTO&gt; edit hello_router.py 3 interface = "GigabitEthernet0/2"
AUTO&gt; sed -i 's/vlan = 10/vlan = 20/' hello_router.py</pre>
<pre class="out">AUTO&gt; python3 hello_router.py
Building config...
<span class="hl">interface GigabitEthernet0/2</span>
<span class="hl"> description Link to PUNE - VLAN 20</span>
 switchport mode access
 switchport access vlan 20</pre>
<p>Finally add one more line at the end (the file has 17 lines, so insert as line 18) that prints the short interface name with <code>replace()</code>:</p>
<pre class="out">AUTO&gt; insert hello_router.py 18 print(interface.replace("GigabitEthernet", "Gi"))</pre>
<pre class="out">AUTO&gt; python3 hello_router.py
Building config...
interface GigabitEthernet0/2
 description Link to PUNE - VLAN 20
 switchport mode access
 switchport access vlan 20
<span class="hl">Gi0/2</span></pre>
<p>The site in the description is <code>PUNE</code>: the variable held <code>"  pune  "</code>, and <code>.strip().upper()</code> in line 11 cleaned it before the f-string used it. Line 4 holds <code>vlan = 20</code> without quotes, so it is an <b>int</b>.</p>
<div class="warn"><p><b>Common mistake.</b> Using single quotes inside a single-quoted f-string, for example <code>f'{info['ip']}'</code>, or forgetting a closing brace. Pick the other quote type for what is inside the braces: <code>f"{info['ip']}"</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> An f-string needs the <code>f</code> prefix to substitute values. Know what <code>f"{{x}}"</code> prints (the text <code>{x}</code>) and that format specs such as <code>:03d</code> or <code>:.2f</code> follow a colon inside the braces.</p></div>
<div class="scn"><h4>Generating 24 descriptions</h4><p>An engineer needed descriptions for 24 uplinks named by floor and port number. Instead of typing them she wrote one f-string with a floor variable and a port variable, and the script printed all 24 lines. Her peer reviewed one line of template instead of 24 lines of text.</p><p><b>Lesson:</b> reviewing one template is safer than reviewing many copies.</p></div>
<div class="iv"><p class="q">"What is an f-string and why use it?"</p><p>An f-string is a string with an <code>f</code> prefix where expressions in curly braces are evaluated and inserted. It is more readable than concatenation, converts numbers automatically and supports format specifications. It is ideal for building configuration lines, log messages and URLs from variables.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Put f before the quote and {name} where a value belongs.</li>
<li>Numbers are converted for you; braces can hold calculations and methods.</li>
<li>Without the f, braces print literally; double them to print real braces.</li>
<li>Format specs follow a colon: {n:03d}, {x:.2f}.</li>
</ul></div>
`,hi:`
<p>Aap pehle se text ko <code>+</code> se jod sakte ho aur numbers ko <code>str()</code> se convert kar sakte ho. Yeh chalta hai, lekin bhaari hai: <code>"interface " + name + " vlan " + str(vlan)</code> galat type hona aasaan hai. Python ke paas bahut achha tool hai, <b>f-string</b> (formatted string literal). Yeh blanks wala template hai. Khulne wale quote se theek pehle <code>f</code> letter lagao, aur jahan variable ki value dikhani ho wahan <code>{name}</code> likho.</p>
<pre class="code">interface = "GigabitEthernet0/2"
vlan = 20
site = "PUNE"
print(f"interface {interface}")
print(f" description Link to {site} - VLAN {vlan}")
print(f" switchport access vlan {vlan}")
print(f" ip address 10.1.{vlan}.1 255.255.255.0")</pre>
<pre class="out">AUTO&gt; python3 f1.py
interface GigabitEthernet0/2
 description Link to PUNE - VLAN 20
 switchport access vlan 20
 ip address 10.1.20.1 255.255.255.0</pre>
<p>Output aisi configuration hai jise aap seedha switch mein paste kar sakte ho. Teen baatein dhyan dene layak hain:</p>
<ul>
<li><code>f</code> quote se <b>seedha</b> pehle hona chahiye, beech mein space nahi.</li>
<li>Numbers ko <code>str()</code> nahi chahiye; f-string unhe khud convert karti hai.</li>
<li>Braces ke andar calculation ya method rakh sakte ho: <code>{site.lower()}</code>, <code>{vlan + 100}</code>.</li>
</ul>
<pre class="code">site = "PUNE"
vlan = 20
print(f"{site.lower()}-sw-{vlan + 100}")</pre>
<pre class="out">AUTO&gt; python3 f2.py
pune-sw-120</pre>
<h3>Numbers ko format karna</h3>
<p>Value ke baad colon aur format jod sakte ho. <code>{n:03d}</code> poore number ko zeros se teen digits tak bharta hai; <code>{x:.2f}</code> do decimals dikhata hai; <code>{text:>8}</code> text ko 8 characters mein right-align karta hai. <code>SW-007</code> jaise barabar chaudai ke naam banane ke kaam ka.</p>
<pre class="code">n = 7
print(f"SW-{n:03d}")
print(f"{3.14159:.2f}")
print(f"[{'Gi0/1':&gt;8}]")</pre>
<pre class="out">AUTO&gt; python3 f3.py
SW-007
3.14
[   Gi0/1]</pre>
<h3>Do traps: chhoota f aur literal braces</h3>
<p><code>f</code> bhool gaye to Python braces waise hi print kar deta hai jaise type kiye. Output mein asli braces chahiye to unhe double karo:</p>
<pre class="code">vlan = 10
print("vlan {vlan}")
print(f"vlan {vlan}")
print(f"{{vlan}} is {vlan}")</pre>
<pre class="out">AUTO&gt; python3 f4.py
vlan {vlan}
vlan 10
{vlan} is 10</pre>
<h3>Lab 1 walk-through</h3>
<p>Lab mein aap <code>hello_router.py</code> chalate ho, do variables badalte ho aur ek line jodte ho. Yeh lines unke numbers ke saath hain, taaki pata rahe kaunsi line edit karni hai:</p>
<pre class="out">AUTO&gt; nl hello_router.py
     1  # hello_router.py - build interface config lines with Python
     2  # A VARIABLE is a named box that stores a value.
     3  interface = "GigabitEthernet0/1"   # a string (text): always inside quotes
     4  vlan = 10                          # an integer (whole number): no quotes
     5  site = "  pune  "                  # messy text with extra spaces
     6  
     7  # print() shows something on the screen
     8  print("Building config...")
     9  
    10  # .strip() removes spaces at both ends, .upper() makes CAPITAL letters
    11  clean_site = site.strip().upper()
    12  
    13  # f-string: put f before the quote, then {name} is replaced by its value
    14  print(f"interface {interface}")
    15  print(f" description Link to {clean_site} - VLAN {vlan}")
    16  print(" switchport mode access")
    17  print(f" switchport access vlan {vlan}")</pre>
<p>Pehle original values ke saath chalao, phir port aur VLAN badlo (sirf line 3 aur 4), aur dobara chalao:</p>
<pre class="out">AUTO&gt; python3 hello_router.py
Building config...
interface GigabitEthernet0/1
 description Link to PUNE - VLAN 10
 switchport mode access
 switchport access vlan 10</pre>
<pre class="out">AUTO&gt; edit hello_router.py 3 interface = "GigabitEthernet0/2"
AUTO&gt; sed -i 's/vlan = 10/vlan = 20/' hello_router.py</pre>
<pre class="out">AUTO&gt; python3 hello_router.py
Building config...
<span class="hl">interface GigabitEthernet0/2</span>
<span class="hl"> description Link to PUNE - VLAN 20</span>
 switchport mode access
 switchport access vlan 20</pre>
<p>Aakhir mein end mein ek aur line jodo (file mein 17 lines hain, isliye line 18 par insert karo) jo <code>replace()</code> se short interface name print kare:</p>
<pre class="out">AUTO&gt; insert hello_router.py 18 print(interface.replace("GigabitEthernet", "Gi"))</pre>
<pre class="out">AUTO&gt; python3 hello_router.py
Building config...
interface GigabitEthernet0/2
 description Link to PUNE - VLAN 20
 switchport mode access
 switchport access vlan 20
<span class="hl">Gi0/2</span></pre>
<p>Description mein site <code>PUNE</code> hai: variable mein <code>"  pune  "</code> tha, aur line 11 ke <code>.strip().upper()</code> ne f-string ke use se pehle ise saaf kiya. Line 4 mein <code>vlan = 20</code> bina quotes ke hai, isliye yeh <b>int</b> hai.</p>
<div class="warn"><p><b>Common galti.</b> Single-quoted f-string ke andar single quotes use karna, jaise <code>f'{info['ip']}'</code>, ya closing brace bhool jaana. Braces ke andar ke liye doosre quote type chuno: <code>f"{info['ip']}"</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> f-string mein values substitute hone ke liye <code>f</code> prefix chahiye. Yaad rakho <code>f"{{x}}"</code> kya print karta hai (text <code>{x}</code>) aur ki <code>:03d</code> ya <code>:.2f</code> jaise format specs braces ke andar colon ke baad aate hain.</p></div>
<div class="scn"><h4>24 descriptions generate karna</h4><p>Ek engineer ko floor aur port number ke naam wale 24 uplinks ki descriptions chahiye thi. Type karne ki jagah usne floor aur port variables wali ek f-string likhi, aur script ne saari 24 lines print ki. Uske peer ne 24 lines ki jagah template ki ek line review ki.</p><p><b>Lesson:</b> ek template review karna kai copies review karne se safe hai.</p></div>
<div class="iv"><p class="q">"f-string kya hai aur ise kyun use karte hain?"</p><p>f-string <code>f</code> prefix wali string hai jisme curly braces ke expressions evaluate hokar insert hote hain. Yeh concatenation se zyada readable hai, numbers khud convert karti hai aur format specifications support karti hai. Variables se configuration lines, log messages aur URLs banane ke liye ideal hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Quote se pehle f lagao aur jahan value chahiye wahan {name}.</li>
<li>Numbers khud convert hote hain; braces mein calculations aur methods aa sakte hain.</li>
<li>f ke bina braces literally print hote hain; asli braces ke liye double karo.</li>
<li>Format specs colon ke baad aate hain: {n:03d}, {x:.2f}.</li>
</ul></div>
`}};export{e as default};