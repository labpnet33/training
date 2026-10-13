var e={id:`first-script`,h:{en:`Your first script, line by line`,hi:`Aapki pehli script, line by line`},body:{en:`
<p>Do not try to memorise a script. Read it like a recipe: top to bottom, one step at a time. Here is the whole of <code>first_script.py</code> in four steps. We take each step and explain every word.</p>
<h3>Step 1: load the SSH tool</h3>
<pre class="code">from nkmiko import ConnectHandler</pre>
<p><code>nkmiko</code> is the lab's SSH library. It works like the popular <b>netmiko</b> library used in real networks. The line says: "from the library nkmiko, bring in the tool called ConnectHandler". <b>ConnectHandler</b> is the tool that logs in to a device. Without this line Python would not know the word ConnectHandler.</p>
<h3>Step 2: the list of routers</h3>
<pre class="code">ROUTERS = ["10.99.0.1", "10.99.0.2"]</pre>
<p>This creates a <b>variable</b> named <code>ROUTERS</code>. A variable is a labelled box that holds a value. The value here is a <b>list</b>: items inside square brackets, separated by commas. Each item is a string (text in quotes). Writing the name in capitals is only a habit that means "this is a setting I may edit".</p>
<h3>Step 3: visit each router</h3>
<pre class="code">for ip in ROUTERS:
    print("Connecting to", ip)
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    print("  Hostname:", conn.find_prompt().replace("#", ""))</pre>
<ul>
<li><code>for ip in ROUTERS:</code> is a <b>loop</b>. It takes the items of the list one by one, puts the current one in the variable <code>ip</code>, and runs the indented lines below. The colon at the end opens the block.</li>
<li><code>ConnectHandler(...)</code> logs in over SSH. The words inside the brackets are <b>arguments</b>: the settings you pass in. <code>device_type</code> says what kind of CLI to expect, <code>host</code> is the IP, then the username and password. The result, a live session, is stored in <code>conn</code>.</li>
<li><code>conn.find_prompt()</code> asks the router for its prompt, for example <code>PUN-CORE-01#</code>. <code>.replace("#", "")</code> swaps the # for nothing, leaving the plain hostname.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Loop steps">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">for ip in list</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">pick next IP</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#ddd6fe"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">ConnectHandler</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">SSH login</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">send_command</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">show version</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">disconnect</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">log out</text>
</svg><p class="cap">What happens for each router in the loop. When the list runs out, the loop ends.</p></div>
<h3>Step 4: ask a question and pick out the answer</h3>
<pre class="code">    output = conn.send_command("show version")
    for line in output.splitlines():
        if "uptime" in line:
            print("  " + line)
    conn.disconnect()</pre>
<p><code>send_command("show version")</code> types the command and gives back everything the router printed as one long <b>string</b>. We store it in <code>output</code>. <code>splitlines()</code> cuts that text into a list of lines. The inner loop looks at each <code>line</code>; <code>if "uptime" in line</code> asks "does this line contain the word uptime?"; only then it prints. <code>disconnect()</code> logs out. Notice the nesting: a loop inside a loop, each indented 4 more spaces.</p>
<p>Here is a tiny script that shows what <code>send_command</code> really returns. The full output has 21 lines, so we keep only the uptime line:</p>
<pre class="code">from nkmiko import ConnectHandler
conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
text = conn.send_command("show version")
print(type(text))
print("lines returned:", len(text.splitlines()))
for line in text.splitlines():
    if "uptime" in line:
        print("kept:", line)
conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 peek.py
&lt;class 'str'&gt;
lines returned: 21
<span class="hl">kept: PUN-CORE-01 uptime is 0 minutes</span></pre>
<h3>Running the real script</h3>
<pre class="out">AUTO&gt; python3 first_script.py
Connecting to 10.99.0.1
<span class="hl">  Hostname: PUN-CORE-01</span>
  PUN-CORE-01 uptime is 0 minutes
Connecting to 10.99.0.2
<span class="hl">  Hostname: BLR-EDGE-02</span>
  BLR-EDGE-02 uptime is 0 minutes
<span class="hl">Done: 2 routers checked</span></pre>
<p>Read the output like the script: for each IP it prints "Connecting to", the hostname, the uptime line, and at the end the count. The uptime shows 0 minutes because the simulated routers have just started; that is a feature of the lab, not a bug in the script.</p>
<div class="eg"><p><b>Worked example.</b> Lab 1 question: "What is the hostname of the router at 10.99.0.2?" Find the line <code>Connecting to 10.99.0.2</code> in the output; the next line shows <code>Hostname: BLR-EDGE-02</code>. The script gave you the answer without you logging in anywhere.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting the indentation or the colon after <code>for</code>. If the lines under <code>for</code> are not pushed right by 4 spaces, Python raises an IndentationError. If the colon is missing, a SyntaxError.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>find_prompt()</code>, <code>send_command()</code> and <code>disconnect()</code> are methods of the connection object. <code>send_command</code> is for show commands (it returns a string); configuration uses a different method, which chapter 6 covers.</p></div>
<div class="scn"><h4>Which router is it?</h4><p>An engineer got an alert about "10.99.0.2" but did not know which site it was. Instead of logging in, he ran the senior's script, which printed the hostname BLR-EDGE-02 for that IP. He knew immediately it was the Bengaluru edge router and called the right team.</p><p><b>Lesson:</b> even a read-only script is useful: it turns IP addresses into names.</p></div>
<div class="iv"><p class="q">"Walk me through a simple script that connects to a router and runs a show command."</p><p>Import the connection tool, build a list of device IPs, loop over the list, open a session with <code>ConnectHandler</code> (device type, host, username, password), run <code>send_command</code>, process the returned text, and <code>disconnect</code>. Mention that credentials should not be hard-coded in real scripts.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ConnectHandler logs in; send_command returns the show output as one string.</li>
<li>A list holds many IPs; a for loop visits each one.</li>
<li>splitlines() turns text into a list of lines; "word" in line tests a line.</li>
<li>Always disconnect when you are done.</li>
</ul></div>
`,hi:`
<p>Script ratne ki koshish mat karo. Ise recipe ki tarah padho: upar se neeche, ek-ek step. Yeh poori <code>first_script.py</code> chaar steps mein hai. Hum har step lete hain aur har word samjhate hain.</p>
<h3>Step 1: SSH tool load karo</h3>
<pre class="code">from nkmiko import ConnectHandler</pre>
<p><code>nkmiko</code> lab ki SSH library hai. Yeh asli networks mein use hone wali popular <b>netmiko</b> library jaisi kaam karti hai. Line kehti hai: "nkmiko library se ConnectHandler naam ka tool le aao". <b>ConnectHandler</b> woh tool hai jo device par login karta hai. Is line ke bina Python ConnectHandler word ko jaanega hi nahi.</p>
<h3>Step 2: routers ki list</h3>
<pre class="code">ROUTERS = ["10.99.0.1", "10.99.0.2"]</pre>
<p>Yeh <code>ROUTERS</code> naam ka ek <b>variable</b> banata hai. Variable ek label laga dabba hai jisme value rehti hai. Yahan value ek <b>list</b> hai: square brackets ke andar items, commas se alag. Har item ek string hai (quotes mein text). Naam capital letters mein likhna sirf ek aadat hai jiska matlab hai "yeh woh setting hai jo main badal sakta hoon".</p>
<h3>Step 3: har router par jao</h3>
<pre class="code">for ip in ROUTERS:
    print("Connecting to", ip)
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    print("  Hostname:", conn.find_prompt().replace("#", ""))</pre>
<ul>
<li><code>for ip in ROUTERS:</code> ek <b>loop</b> hai. Yeh list ke items ko ek-ek karke leta hai, current item ko variable <code>ip</code> mein rakhta hai, aur neeche ki indented lines chalata hai. End ka colon block kholta hai.</li>
<li><code>ConnectHandler(...)</code> SSH se login karta hai. Brackets ke andar ke words <b>arguments</b> hain: aap jo settings pass karte ho. <code>device_type</code> batata hai kaunsa CLI expect karna hai, <code>host</code> IP hai, phir username aur password. Result, ek live session, <code>conn</code> mein store hota hai.</li>
<li><code>conn.find_prompt()</code> router se uska prompt maangta hai, jaise <code>PUN-CORE-01#</code>. <code>.replace("#", "")</code> # ko khaali se badal deta hai, aur sirf hostname bachta hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Loop steps">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">for ip in list</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">agla IP uthao</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#ddd6fe"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">ConnectHandler</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">SSH login</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">send_command</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">show version</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">disconnect</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">logout</text>
</svg><p class="cap">Loop mein har router ke liye kya hota hai. List khatam hote hi loop khatam.</p></div>
<h3>Step 4: sawaal poochho aur jawab chhaanto</h3>
<pre class="code">    output = conn.send_command("show version")
    for line in output.splitlines():
        if "uptime" in line:
            print("  " + line)
    conn.disconnect()</pre>
<p><code>send_command("show version")</code> command type karta hai aur router ne jo print kiya woh sab ek lambi <b>string</b> ki tarah wapas deta hai. Hum ise <code>output</code> mein rakhte hain. <code>splitlines()</code> us text ko lines ki list mein kaat deta hai. Andar wala loop har <code>line</code> dekhta hai; <code>if "uptime" in line</code> poochta hai "kya is line mein uptime word hai?"; tabhi print hota hai. <code>disconnect()</code> logout karta hai. Nesting dekho: loop ke andar loop, har ek 4 spaces aur andar.</p>
<p>Yeh ek chhota script hai jo dikhata hai <code>send_command</code> asal mein kya return karta hai. Poore output mein 21 lines hain, isliye hum sirf uptime wali line rakhte hain:</p>
<pre class="code">from nkmiko import ConnectHandler
conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
text = conn.send_command("show version")
print(type(text))
print("lines returned:", len(text.splitlines()))
for line in text.splitlines():
    if "uptime" in line:
        print("kept:", line)
conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 peek.py
&lt;class 'str'&gt;
lines returned: 21
<span class="hl">kept: PUN-CORE-01 uptime is 0 minutes</span></pre>
<h3>Asli script chalana</h3>
<pre class="out">AUTO&gt; python3 first_script.py
Connecting to 10.99.0.1
<span class="hl">  Hostname: PUN-CORE-01</span>
  PUN-CORE-01 uptime is 0 minutes
Connecting to 10.99.0.2
<span class="hl">  Hostname: BLR-EDGE-02</span>
  BLR-EDGE-02 uptime is 0 minutes
<span class="hl">Done: 2 routers checked</span></pre>
<p>Output ko script ki tarah padho: har IP ke liye woh "Connecting to", hostname, uptime line, aur end mein count print karta hai. Uptime 0 minutes isliye hai kyunki simulated routers abhi start hue hain; yeh lab ki khaasiyat hai, script ka bug nahi.</p>
<div class="eg"><p><b>Worked example.</b> Lab 1 sawaal: "10.99.0.2 wale router ka hostname kya hai?" Output mein <code>Connecting to 10.99.0.2</code> line dhoondho; agli line <code>Hostname: BLR-EDGE-02</code> dikhati hai. Script ne aapko bina kahin login kiye jawab de diya.</p></div>
<div class="warn"><p><b>Common galti.</b> <code>for</code> ke baad indentation ya colon bhool jaana. Agar <code>for</code> ke neeche ki lines 4 spaces right nahi hain to Python IndentationError deta hai. Colon missing ho to SyntaxError.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>find_prompt()</code>, <code>send_command()</code> aur <code>disconnect()</code> connection object ke methods hain. <code>send_command</code> show commands ke liye hai (yeh string return karta hai); configuration ke liye alag method hai, jo chapter 6 mein hai.</p></div>
<div class="scn"><h4>Yeh kaunsa router hai?</h4><p>Ek engineer ko "10.99.0.2" ka alert mila lekin pata nahi tha yeh kaunsi site hai. Login karne ki jagah usne senior ka script chalaya, jisne us IP ke liye hostname BLR-EDGE-02 print kiya. Use turant pata chal gaya ki yeh Bengaluru edge router hai aur usne sahi team ko call kiya.</p><p><b>Lesson:</b> read-only script bhi kaam ka hai: yeh IP addresses ko names mein badal deta hai.</p></div>
<div class="iv"><p class="q">"Ek simple script samjhao jo router se connect karke show command chalata hai."</p><p>Connection tool import karo, device IPs ki list banao, list par loop chalao, <code>ConnectHandler</code> (device type, host, username, password) se session kholo, <code>send_command</code> chalao, wapas aaya text process karo, aur <code>disconnect</code> karo. Yeh bhi bolo ki asli scripts mein credentials hard-code nahi karne chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ConnectHandler login karta hai; send_command show output ek string ki tarah deta hai.</li>
<li>List mein kai IPs; for loop har ek par jaata hai.</li>
<li>splitlines() text ko lines ki list banata hai; "word" in line line test karta hai.</li>
<li>Kaam khatam hone par hamesha disconnect karo.</li>
</ul></div>
`}};export{e as default};