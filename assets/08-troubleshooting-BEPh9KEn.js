var e={id:`troubleshooting`,h:{en:`Troubleshooting scripts: reading errors and surviving a dead router`,hi:`Scripts ka troubleshooting: errors padhna aur mare hue router se bachna`},body:{en:`

<p>Scripts fail. Beginners think failure means "I am bad at this". Professionals know it means "the computer is telling me exactly what it did not like". This chapter gives you a method for reading that message, then walks through the problems of both labs.</p>

<h3>The method: read from the bottom</h3>
<p>A <b>traceback</b> lists the calls Python was in, oldest first, and ends with the <b>exception</b>: the error name and a message. The last line is the one that matters. The line above it shows the file name and line number; open that line first.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="The last line of the traceback tells you which of six places to look at first."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="220" y="8" width="200" height="40" rx="10" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="14">Read the LAST line</text><line x1="320" y1="48" x2="320" y2="66" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="10" y="70" width="190" height="56" rx="10" fill="#fed7aa"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="14">SyntaxError / Indentation</text><text x="105" y="113" text-anchor="middle" class="svg-muted" font-size="12">fix the code shape</text><rect x="225" y="70" width="190" height="56" rx="10" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">NetmikoTimeout</text><text x="320" y="113" text-anchor="middle" class="svg-muted" font-size="12">ping, port 22, SSH setup</text><rect x="440" y="70" width="190" height="56" rx="10" fill="#bbf7d0"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="14">NetmikoAuthentication</text><text x="535" y="113" text-anchor="middle" class="svg-muted" font-size="12">user, password, login local</text><rect x="10" y="150" width="190" height="56" rx="10" fill="#ddd6fe"/><text x="105" y="175" text-anchor="middle" class="svg-ink" font-size="14">FileNotFound</text><text x="105" y="193" text-anchor="middle" class="svg-muted" font-size="12">mode "r" vs "w", name</text><rect x="225" y="150" width="190" height="56" rx="10" fill="#e2e8f0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="14">KeyError / TypeError</text><text x="320" y="193" text-anchor="middle" class="svg-muted" font-size="12">print the data, check keys</text><rect x="440" y="150" width="190" height="56" rx="10" fill="#fde68a"/><text x="535" y="175" text-anchor="middle" class="svg-ink" font-size="14">No error, wrong result</text><text x="535" y="193" text-anchor="middle" class="svg-muted" font-size="12">verify against real output</text></svg><p class="cap">The last line of the traceback tells you which of six places to look at first.</p></div>

<h3>The six places, with real examples</h3>
<table class="cmp"><tr><th>Last line says</th><th>Meaning</th><th>First check</th></tr>
<tr><td>NetmikoTimeoutException</td><td>TCP 22 never opened</td><td>ping, <code>show ip ssh</code>, <code>transport input ssh</code>, ACLs</td></tr>
<tr><td>NetmikoAuthenticationException</td><td>Connected, login refused</td><td>user, password (case!), <code>login local</code></td></tr>
<tr><td>FileNotFoundError</td><td>Opened a missing file with <code>"r"</code></td><td>mode and file name</td></tr>
<tr><td>KeyError</td><td>Dictionary has no such key</td><td>print the dictionary, check spelling</td></tr>
<tr><td>SyntaxError / IndentationError</td><td>Python cannot read the file</td><td>the line shown: brackets, colon, spaces</td></tr>
<tr><td>OSError: Socket is closed</td><td>Used the session after disconnect()</td><td>move disconnect() to the end</td></tr></table>
<p>Three more, shown with the actual lab messages. A missing key, where the script asks for a router that is not in the dictionary:</p>
<pre class="out">AUTO&gt; python3 keyerr.py
Traceback (most recent call last):
  File "keyerr.py", line 2, in &lt;module&gt;
    print(PLAN["10.99.0.2"])
<span class="hl">KeyError: '10.99.0.2'</span></pre>
<p>A bracket that was never closed. Python reports the line where the bracket <i>opened</i>:</p>
<pre class="out">AUTO&gt; python3 syntax.py
  File "syntax.py", line 1
    print("hello"
         ^
<span class="hl">SyntaxError: '(' was never closed</span></pre>
<p>A session used after it was closed:</p>
<pre class="out">AUTO&gt; python3 closed.py
Traceback (most recent call last):
  File "closed.py", line 5, in &lt;module&gt;
    print(conn.send_command("show clock"))
<span class="hl">OSError: Socket is closed</span></pre>
<p>And one that is not an error at all. A command the router rejects comes back as <i>text</i>:</p>
<pre class="out">AUTO&gt; python3 badcmd.py
        ^
<span class="hl">% Invalid input detected at '^' marker.</span></pre>
<p>The script shows the router's complaint and carries on without raising anything. Remember Chapter 6: the router's own errors are inside the output.</p>

<h3>Lab 1 walkthrough: backup all three routers</h3>
<ol>
<li><b>First run</b>: <code>FileNotFoundError: ... 'R1.cfg'</code>. The script opened the file with mode <code>"r"</code> on line 15. Change it to <code>"w"</code>.</li>
<li><b>Second run</b>: R1 and R2 work, then <code>NetmikoTimeoutException</code> for 10.99.0.3. Timeout, so check reachability and SSH on R3: ping works, <code>show ip ssh</code> says "SSH Disabled". Apply the eight lines from Chapter 2 on R3.</li>
<li><b>Third run</b>: the placeholder <code>pass</code> in the TODO writes nothing. Replace it with <code>f.write(config)</code>. Run again; all three files exist.</li>
<li><b>Verify by eye</b>: <code>cat R3.cfg</code> and read the address on <code>GigabitEthernet0/1</code>.</li>
</ol>

<h3>Lab 2 walkthrough: OSPF push and verify</h3>
<ol>
<li>Run <code>ospf.py</code> unchanged and count the "OSPF pushed to" lines: two. R3 was missing from <code>PLAN</code>.</li>
<li>Add the R3 entry (its loopback 3.3.3.3 and the link 10.23.0.0/30) and run again: three lines.</li>
<li>Wait about a minute and check by hand with <code>show ip ospf neighbor</code> on R2: two neighbours, FULL.</li>
<li>Run <code>verify.py</code>: it says 0. The test used <code>==</code> against <code>"FULL"</code>; change it to <code>startswith("FULL")</code> and the total is 4.</li>
</ol>

<h3>try and except: keep going when one device fails</h3>
<p>When a device is down, a script should say so and continue. <code>try</code> runs a block and watches for errors. <code>except SomeError:</code> runs only if that error happens. <code>continue</code> jumps to the next item of the loop.</p>
<pre class="code">from nkmiko import ConnectHandler
from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]

for ip in ROUTERS:
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    except NetmikoTimeoutException:
        print(ip, "UNREACHABLE: could not open TCP 22")
        continue
    except NetmikoAuthenticationException:
        print(ip, "LOGIN FAILED: check username and password")
        continue
    print(ip, "OK", conn.find_prompt())
    conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 safe.py   (R3 not yet prepared)
10.99.0.1 OK R1#
10.99.0.2 OK R2#
<span class="hl">10.99.0.3 UNREACHABLE: could not open TCP 22</span></pre>
<p>The same script after R3 is prepared:</p>
<pre class="out">AUTO&gt; python3 safe.py
10.99.0.1 OK R1#
10.99.0.2 OK R2#
<span class="hl">10.99.0.3 OK R3#</span></pre>
<p>Catch the <b>specific</b> exceptions you expect, not every error. A bare <code>except:</code> would also hide your own typos.</p>

<h3>A small audit script that survives a dead router</h3>
<p>This script combines everything: it loops, handles two failure types, parses and counts. The fourth address, 10.99.0.9, does not exist on purpose:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException
from nkparse import parse

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.9"]

for ip in ROUTERS:
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    except NetmikoTimeoutException:
        print(ip, "UNREACHABLE")
        continue
    except NetmikoAuthenticationException:
        print(ip, "LOGIN FAILED")
        continue
    name = conn.find_prompt().rstrip("#&gt;")
    data = parse("show ip ospf neighbor", conn.send_command("show ip ospf neighbor"))
    count = 0
    for intf, info in data["interfaces"].items():
        count = count + len(info["neighbors"])
    conn.disconnect()
    print(name, ip, "OSPF neighbours:", count)</pre>
<pre class="out">AUTO&gt; python3 audit.py
R1 10.99.0.1 OSPF neighbours: 1
R2 10.99.0.2 OSPF neighbours: 2
R3 10.99.0.3 OSPF neighbours: 1
<span class="hl">10.99.0.9 UNREACHABLE</span></pre>
<p>Three routers report their neighbour count and the missing one is reported, not fatal. This is the shape of a real nightly health check.</p>

<div class="eg"><p><b>Worked example.</b> At 02:00 the audit prints "10.99.0.2 UNREACHABLE". The on-call engineer does not guess. Ping from AUTO: no reply, so it is not an SSH problem. Next check: the switch port or the router itself. A timeout with working ping would have pointed to <code>show ip ssh</code>; "LOGIN FAILED" would have pointed to the user and password. The word printed by the script already narrowed the search.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Fixing the wrong layer: changing the network when the error says the credentials are wrong. (2) Catching every exception and printing nothing, which hides real bugs. (3) Reading a traceback from the top. (4) Changing three things at once; change one, run again.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeout means the connection never opened (network, port or SSH setup). Authentication means it opened and the login failed. Both are netmiko exceptions in <code>netmiko.exceptions</code>; the lab library names are the same style.</p></div>

<div class="scn"><h4>One dead branch stopped 200 backups</h4><p>A backup script looped over 200 routers without error handling. A branch lost power at router number 17 and the script died with a timeout; the other 183 routers were never backed up that night. Nobody noticed for two weeks. After adding <code>try</code> and <code>except</code>, the script finished all reachable routers and e-mailed a list of the ones that failed.</p><p><b>Lesson:</b> one failure must never stop the rest, and failures must be reported loudly.</p></div>

<div class="iv"><p class="q">"Your script times out connecting to a router. How do you troubleshoot?"</p><p>I read the exception: timeout means the TCP connection to port 22 did not open. I ping the router, then check that SSH is enabled with <code>show ip ssh</code>, the vty lines allow SSH with <code>transport input ssh</code>, and nothing such as an access list blocks my source. If it was an authentication exception I would check the user, password and <code>login local</code> instead. I change one thing at a time and re-run.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read a traceback from the bottom: exception name first, then file and line.</li>
<li>Timeout = never connected; authentication = connected but refused.</li>
<li>Router rejections come back as text, not as Python errors; check the returned text.</li>
<li>Use <code>try</code>/<code>except</code> with specific exceptions and <code>continue</code> so one dead device does not stop the loop.</li>
<li>Change one thing at a time and re-run.</li>
</ul></div>

`,hi:`

<p>Scripts fail hoti hain. Beginners sochte hain failure ka matlab "mujhe yeh nahi aata". Professionals jaante hain ki iska matlab hai "computer bata raha hai ki use bilkul kya pasand nahi aaya". Yeh chapter us message ko padhne ka tareeka deta hai, phir dono labs ki problems ko step by step chalta hai.</p>

<h3>Tareeka: neeche se padho</h3>
<p><b>Traceback</b> un calls ki list hai jinke andar Python tha, purane se naye tak, aur <b>exception</b> par khatam hota hai: error ka naam aur message. Aakhri line hi zaroori hai. Uske upar ki line file ka naam aur line number dikhati hai; pehle wahi line kholo.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Traceback ki aakhri line batati hai ki pehle chhe jagahon mein se kahan dekhna hai."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="220" y="8" width="200" height="40" rx="10" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="14">AAKHRI line padho</text><line x1="320" y1="48" x2="320" y2="66" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="10" y="70" width="190" height="56" rx="10" fill="#fed7aa"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="14">SyntaxError / Indentation</text><text x="105" y="113" text-anchor="middle" class="svg-muted" font-size="12">code ki shakal theek karo</text><rect x="225" y="70" width="190" height="56" rx="10" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">NetmikoTimeout</text><text x="320" y="113" text-anchor="middle" class="svg-muted" font-size="12">ping, port 22, SSH setup</text><rect x="440" y="70" width="190" height="56" rx="10" fill="#bbf7d0"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="14">NetmikoAuthentication</text><text x="535" y="113" text-anchor="middle" class="svg-muted" font-size="12">user, password, login local</text><rect x="10" y="150" width="190" height="56" rx="10" fill="#ddd6fe"/><text x="105" y="175" text-anchor="middle" class="svg-ink" font-size="14">FileNotFound</text><text x="105" y="193" text-anchor="middle" class="svg-muted" font-size="12">mode "r" vs "w", naam</text><rect x="225" y="150" width="190" height="56" rx="10" fill="#e2e8f0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="14">KeyError / TypeError</text><text x="320" y="193" text-anchor="middle" class="svg-muted" font-size="12">data print karo, keys check karo</text><rect x="440" y="150" width="190" height="56" rx="10" fill="#fde68a"/><text x="535" y="175" text-anchor="middle" class="svg-ink" font-size="14">Error nahi, result galat</text><text x="535" y="193" text-anchor="middle" class="svg-muted" font-size="12">asli output se verify karo</text></svg><p class="cap">Traceback ki aakhri line batati hai ki pehle chhe jagahon mein se kahan dekhna hai.</p></div>

<h3>Chhe jagah, asli examples ke saath</h3>
<table class="cmp"><tr><th>Aakhri line mein</th><th>Matlab</th><th>Pehle check</th></tr>
<tr><td>NetmikoTimeoutException</td><td>TCP 22 kabhi khula hi nahi</td><td>ping, <code>show ip ssh</code>, <code>transport input ssh</code>, ACLs</td></tr>
<tr><td>NetmikoAuthenticationException</td><td>Connect hua, login mana</td><td>user, password (case!), <code>login local</code></td></tr>
<tr><td>FileNotFoundError</td><td><code>"r"</code> se missing file kholi</td><td>mode aur file naam</td></tr>
<tr><td>KeyError</td><td>Dictionary mein aisi key nahi</td><td>dictionary print karo, spelling check karo</td></tr>
<tr><td>SyntaxError / IndentationError</td><td>Python file padh hi nahi pa raha</td><td>dikhayi gayi line: brackets, colon, spaces</td></tr>
<tr><td>OSError: Socket is closed</td><td>disconnect() ke baad session use kiya</td><td>disconnect() ko end mein le jao</td></tr></table>
<p>Teen aur, asli lab messages ke saath. Missing key, jahan script aise router ko maangti hai jo dictionary mein nahi hai:</p>
<pre class="out">AUTO&gt; python3 keyerr.py
Traceback (most recent call last):
  File "keyerr.py", line 2, in &lt;module&gt;
    print(PLAN["10.99.0.2"])
<span class="hl">KeyError: '10.99.0.2'</span></pre>
<p>Aisa bracket jo kabhi band nahi hua. Python us line ko report karta hai jahan bracket <i>khula</i> tha:</p>
<pre class="out">AUTO&gt; python3 syntax.py
  File "syntax.py", line 1
    print("hello"
         ^
<span class="hl">SyntaxError: '(' was never closed</span></pre>
<p>Band hone ke baad use hua session:</p>
<pre class="out">AUTO&gt; python3 closed.py
Traceback (most recent call last):
  File "closed.py", line 5, in &lt;module&gt;
    print(conn.send_command("show clock"))
<span class="hl">OSError: Socket is closed</span></pre>
<p>Aur ek jo error hai hi nahi. Router jo command reject karta hai woh <i>text</i> ke roop mein wapas aata hai:</p>
<pre class="out">AUTO&gt; python3 badcmd.py
        ^
<span class="hl">% Invalid input detected at '^' marker.</span></pre>
<p>Script router ki shikayat dikhati hai aur kuch raise kiye bina aage badh jaati hai. Chapter 6 yaad rakho: router ke apne errors output ke andar hote hain.</p>

<h3>Lab 1 walkthrough: teeno routers ka backup</h3>
<ol>
<li><b>Pehli run</b>: <code>FileNotFoundError: ... 'R1.cfg'</code>. Script ne line 15 par file mode <code>"r"</code> se kholi. Use <code>"w"</code> kar do.</li>
<li><b>Doosri run</b>: R1 aur R2 chalte hain, phir 10.99.0.3 ke liye <code>NetmikoTimeoutException</code>. Timeout hai, to R3 par reachability aur SSH check karo: ping chalta hai, <code>show ip ssh</code> "SSH Disabled" kehta hai. R3 par Chapter 2 ki aath lines lagao.</li>
<li><b>Teesri run</b>: TODO ka placeholder <code>pass</code> kuch nahi likhta. Use <code>f.write(config)</code> se badlo. Dobara chalao; teeno files ban jaati hain.</li>
<li><b>Aankh se verify</b>: <code>cat R3.cfg</code> chalao aur <code>GigabitEthernet0/1</code> ka address padho.</li>
</ol>

<h3>Lab 2 walkthrough: OSPF push aur verify</h3>
<ol>
<li><code>ospf.py</code> ko jaisa hai waise chalao aur "OSPF pushed to" lines gino: do. R3 <code>PLAN</code> mein missing tha.</li>
<li>R3 ki entry jodo (uska loopback 3.3.3.3 aur link 10.23.0.0/30) aur dobara chalao: teen lines.</li>
<li>Lagbhag ek minute ruko aur R2 par <code>show ip ospf neighbor</code> se haath se check karo: do neighbours, FULL.</li>
<li><code>verify.py</code> chalao: yeh 0 bolti hai. Test ne <code>==</code> se <code>"FULL"</code> compare kiya; use <code>startswith("FULL")</code> kar do aur total 4 ho jaata hai.</li>
</ol>

<h3>try aur except: ek device fail ho to bhi aage chalo</h3>
<p>Jab koi device down ho, script ko batana chahiye aur aage badhna chahiye. <code>try</code> ek block chalata hai aur errors par nazar rakhta hai. <code>except SomeError:</code> tabhi chalta hai jab wahi error aaye. <code>continue</code> loop ke agle item par kood jaata hai.</p>
<pre class="code">from nkmiko import ConnectHandler
from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]

for ip in ROUTERS:
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    except NetmikoTimeoutException:
        print(ip, "UNREACHABLE: could not open TCP 22")
        continue
    except NetmikoAuthenticationException:
        print(ip, "LOGIN FAILED: check username and password")
        continue
    print(ip, "OK", conn.find_prompt())
    conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 safe.py   (R3 abhi ready nahi)
10.99.0.1 OK R1#
10.99.0.2 OK R2#
<span class="hl">10.99.0.3 UNREACHABLE: could not open TCP 22</span></pre>
<p>R3 ready hone ke baad wahi script:</p>
<pre class="out">AUTO&gt; python3 safe.py
10.99.0.1 OK R1#
10.99.0.2 OK R2#
<span class="hl">10.99.0.3 OK R3#</span></pre>
<p><b>Specific</b> exceptions pakdo jo aap expect karte ho, har error nahi. Akela <code>except:</code> aapke apne typos bhi chhupa deta.</p>

<h3>Chhoti audit script jo mare hue router se bach nikalti hai</h3>
<p>Yeh script sab kuch milati hai: loop, do failure types handle, parse aur count. Chautha address, 10.99.0.9, jaanbujhkar maujood nahi hai:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException
from nkparse import parse

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.9"]

for ip in ROUTERS:
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    except NetmikoTimeoutException:
        print(ip, "UNREACHABLE")
        continue
    except NetmikoAuthenticationException:
        print(ip, "LOGIN FAILED")
        continue
    name = conn.find_prompt().rstrip("#&gt;")
    data = parse("show ip ospf neighbor", conn.send_command("show ip ospf neighbor"))
    count = 0
    for intf, info in data["interfaces"].items():
        count = count + len(info["neighbors"])
    conn.disconnect()
    print(name, ip, "OSPF neighbours:", count)</pre>
<pre class="out">AUTO&gt; python3 audit.py
R1 10.99.0.1 OSPF neighbours: 1
R2 10.99.0.2 OSPF neighbours: 2
R3 10.99.0.3 OSPF neighbours: 1
<span class="hl">10.99.0.9 UNREACHABLE</span></pre>
<p>Teen routers apna neighbour count report karte hain aur missing router report hota hai, fatal nahi. Asli nightly health check ki yahi shakal hai.</p>

<div class="eg"><p><b>Worked example.</b> Raat 02:00 par audit "10.99.0.2 UNREACHABLE" print karta hai. On-call engineer andaza nahi lagata. AUTO se ping: jawab nahi, matlab SSH problem nahi hai. Agla check: switch port ya router khud. Ping chalte hue timeout hota to <code>show ip ssh</code> ki taraf ishaara hota; "LOGIN FAILED" user aur password ki taraf. Script ke print kiye shabd ne khoj pehle hi chhoti kar di.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Galat layer theek karna: error kehta hai credentials galat hain aur aap network badalte ho. (2) Har exception pakadna aur kuch print na karna, jisse asli bugs chhup jaate hain. (3) Traceback ko upar se padhna. (4) Teen cheezein ek saath badalna; ek badlo, dobara chalao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeout matlab connection kabhi khula nahi (network, port ya SSH setup). Authentication matlab khula aur login fail hua. Dono <code>netmiko.exceptions</code> ke netmiko exceptions hain; lab library ke naam isi tarah ke hain.</p></div>

<div class="scn"><h4>Ek dead branch ne 200 backups rok diye</h4><p>Ek backup script 200 routers par bina error handling ke loop chalati thi. Router number 17 par ek branch ki bijli gayi aur script timeout ke saath mar gayi; baaki 183 routers ka us raat backup hua hi nahi. Do hafte tak kisi ko pata nahi chala. <code>try</code> aur <code>except</code> jodne ke baad script ne saare reachable routers khatam kiye aur fail hue routers ki list e-mail ki.</p><p><b>Lesson:</b> ek failure baaki ko kabhi na roke, aur failures zor se report hon.</p></div>

<div class="iv"><p class="q">"Aapki script router se connect karte waqt timeout deti hai. Troubleshoot kaise karoge?"</p><p>Main exception padhta hoon: timeout matlab port 22 par TCP connection khula nahi. Main router ko ping karta hoon, phir check karta hoon ki SSH <code>show ip ssh</code> se enable hai, vty lines <code>transport input ssh</code> se SSH allow karti hain, aur koi access list jaisi cheez mera source block nahi kar rahi. Authentication exception hota to main user, password aur <code>login local</code> check karta. Ek cheez ek baar mein badalta hoon aur dobara chalata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traceback neeche se padho: pehle exception ka naam, phir file aur line.</li>
<li>Timeout = kabhi connect nahi hua; authentication = connect hua par mana.</li>
<li>Router rejections text ke roop mein wapas aate hain, Python errors ke roop mein nahi; return hua text check karo.</li>
<li>Specific exceptions ke saath <code>try</code>/<code>except</code> aur <code>continue</code> use karo taaki ek dead device loop na roke.</li>
<li>Ek cheez ek baar mein badlo aur dobara chalao.</li>
</ul></div>

`}};export{e as default};