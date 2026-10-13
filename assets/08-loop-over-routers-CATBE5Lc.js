var e={id:`loop-over-routers`,h:{en:`Loop over routers: Lab 2, the up-interface check`,hi:`Routers par loop: Lab 2, up-interface check`},body:{en:`
<p>Now put everything together on live (simulated) routers. The Mumbai site of Kaveri Foods has three routers: MUM-R1, MUM-R2 and MUM-R3. The script <code>check_up.py</code> logs in to each, reads <code>show ip interface brief</code>, and should count the interfaces that are up and warn about any that are down. The parts that log in and read are done; the counting and the warning are your TODOs. This is a full automation job: a list of devices, a loop, a parsed dictionary, a counter, a collector list and an if.</p>
<h3>Reading the parsed table</h3>
<p>Router output is text. The lab library <code>nkparse</code> turns that text table into a dictionary so you do not have to cut columns yourself: the key is the interface name and the value is a dictionary of its fields. This is what it gives for MUM-R3:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.3", username="netops", password="NK@2026")
output = conn.send_command("show ip interface brief")
conn.disconnect()
table = parse("show ip interface brief", output)["interface"]
print(type(table))
print(len(table))
print(table["GigabitEthernet0/2"])
for intf, info in table.items():
    print(intf, "-&gt;", info["status"])</pre>
<pre class="out">AUTO&gt; python3 pp.py
&lt;class 'dict'&gt;
4
{'ip_address': '10.3.2.1', 'interface_is_ok': 'YES', 'method': 'manual', 'status': 'down', 'protocol': 'down'}
GigabitEthernet0/0 -&gt; up
GigabitEthernet0/1 -&gt; up
<span class="hl">GigabitEthernet0/2 -&gt; down</span>
GigabitEthernet0/3 -&gt; administratively down</pre>
<p>Three statuses appear: <code>up</code>, <code>down</code> (a real link problem: the cable or the far end) and <code>administratively down</code> (someone shut it on purpose). Your logic must treat them differently, exactly as in chapter 6.</p>
<h3>The starting script</h3>
<pre class="out">     5  ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]   # a list of router IPs
    17      for intf, info in table.items():
    18          pass        # TODO 1: if info["status"] == "up", add 1 to up
    19                      # TODO 2: elif info["status"] == "down", append intf to down
    20      print(f"{name}: {up} interfaces up")
    21      # TODO 3: if the down list is not empty, print a WARNING line</pre>
<pre class="out">AUTO&gt; python3 check_up.py
<span class="hl">MUM-R1: 0 interfaces up</span>
<span class="hl">MUM-R2: 0 interfaces up</span>
<span class="hl">MUM-R3: 0 interfaces up</span>
Check finished</pre>
<p>The script runs and visits all three routers, but every count is 0 because the inner loop only says <code>pass</code> (do nothing). Line 5 is the router list; lines 15 and 16 create the counter <code>up</code> and the collector <code>down</code> for each router; line 17 starts the inner loop.</p>
<h3>TODO 1: count the up interfaces</h3>
<pre class="out">AUTO&gt; edit check_up.py 18         if info["status"] == "up":
AUTO&gt; edit check_up.py 19             up = up + 1</pre>
<pre class="out">AUTO&gt; python3 check_up.py
<span class="hl">MUM-R1: 2 interfaces up</span>
<span class="hl">MUM-R2: 3 interfaces up</span>
<span class="hl">MUM-R3: 2 interfaces up</span>
Check finished</pre>
<p>Remember the indentation: the <code>if</code> is inside the inner loop (8 spaces) and the <code>up = up + 1</code> is inside the <code>if</code> (12 spaces). The counts are 2, 3 and 2.</p>
<p>If you get the indentation wrong, for example by putting the increment at 8 spaces, Python tells you at once:</p>
<pre class="out">AUTO&gt; python3 check_up.py
  File "check_up.py", line 19
    up = up + 1
    ^
<span class="hl">IndentationError: expected an indented block after 'if' statement on line 18</span></pre>
<h3>TODO 2 and 3: collect down interfaces and warn</h3>
<pre class="out">AUTO&gt; insert check_up.py 20         elif info["status"] == "down":
AUTO&gt; insert check_up.py 21             down.append(intf)
AUTO&gt; insert check_up.py 24     if len(down) &gt; 0:
AUTO&gt; insert check_up.py 25         print(f"  WARNING {name}: down -&gt; {down}")</pre>
<pre class="out">AUTO&gt; python3 check_up.py
MUM-R1: 2 interfaces up
MUM-R2: 3 interfaces up
MUM-R3: 2 interfaces up
<span class="hl">  WARNING MUM-R3: down -&gt; ['GigabitEthernet0/2']</span>
Check finished</pre>
<p>Now MUM-R3 is flagged: its <code>GigabitEthernet0/2</code> is really down. MUM-R1 has a port that is <code>administratively down</code> (shut on purpose) and is not flagged, because the <code>elif</code> asks for exactly <code>"down"</code>. Adding up the three counts (2 + 3 + 2) gives 7 interfaces up across the site.</p>
<h3>The finished script</h3>
<pre class="code"><span class="c"># check_up.py - visit every router and count the interfaces that are up</span>
from nkmiko import ConnectHandler
from nkparse import parse

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]   <span class="c"># a list of router IPs</span>

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    name = conn.find_prompt().replace("#", "")       <span class="c"># the hostname, e.g. MUM-R1</span>
    output = conn.send_command("show ip interface brief")
    conn.disconnect()
    <span class="c"># parse() turns the text table into a dictionary of interfaces:</span>
    <span class="c"># {"GigabitEthernet0/0": {"ip_address": "10.99.0.1", "status": "up", ...}, ...}</span>
    table = parse("show ip interface brief", output)["interface"]
    up = 0          <span class="c"># counter: interfaces that are up</span>
    down = []       <span class="c"># list: interfaces that are down (link/cable problem)</span>
    for intf, info in table.items():
        if info["status"] == "up":
            up = up + 1
        elif info["status"] == "down":
            down.append(intf)
    print(f"{name}: {up} interfaces up")
    <span class="c"># TODO 3: if the down list is not empty, print a WARNING line</span>
    if len(down) &gt; 0:
        print(f"  WARNING {name}: down -&gt; {down}")

print("Check finished")</pre>
<div class="eg"><p><b>Worked example.</b> To check a fourth router later you add its management IP to <code>ROUTERS</code>. Nothing else changes. The same loop, counter and warning logic covers it.</p></div>
<div class="warn"><p><b>Common mistake.</b> Counting <code>administratively down</code> as a fault. A shut port is intentional, so warning on it creates noise. Also keep the connection open only as long as you need it: the script disconnects before it processes the text, which is fine because the text is already in the variable <code>output</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Be able to read nested loop code and say what it prints. Also remember that parsed output is a dictionary keyed by interface name, and that the status field distinguishes <code>up</code>, <code>down</code> and <code>administratively down</code>.</p></div>
<div class="scn"><h4>Which router has the dead link?</h4><p>After a power cut, the Mumbai NOC saw reduced traffic but no device alarms. An engineer ran the up-interface script across the site. Within seconds it printed one WARNING line naming MUM-R3 and GigabitEthernet0/2. A technician found a loose patch cable. Nothing else in the list was flagged, which saved a long manual search.</p><p><b>Lesson:</b> a loop, a parsed table and a precise condition find a needle in a haystack.</p></div>
<div class="iv"><p class="q">"Describe how you would check all interfaces on many routers and report only real problems."</p><p>Keep a list of device IPs, loop over them, log in, run the interface summary command, parse it into a dictionary keyed by interface, loop over the interfaces and collect those whose status is exactly down (ignoring administratively down). Print a warning per device only when the collected list is not empty, and print a short summary at the end.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Combine a device list, a loop, a parsed dictionary, a counter, a collector and an if.</li>
<li>Status up counts; exactly down is a fault; administratively down is intentional.</li>
<li>Indentation levels: 4 for the router loop, 8 for the interface loop, 12 inside the if.</li>
<li>Adding a router is one new IP in the list.</li>
</ul></div>
`,hi:`
<p>Ab sab kuch live (simulated) routers par jodo. Kaveri Foods ki Mumbai site par teen routers hain: MUM-R1, MUM-R2 aur MUM-R3. Script <code>check_up.py</code> har ek par login karta hai, <code>show ip interface brief</code> padhta hai, aur up interfaces ginne aur down interfaces par warning dene wala hona chahiye. Login aur padhne wale hisse ready hain; counting aur warning aapke TODOs hain. Yeh poora automation job hai: devices ki list, loop, parsed dictionary, counter, collector list aur if.</p>
<h3>Parsed table padhna</h3>
<p>Router output text hota hai. Lab library <code>nkparse</code> us text table ko dictionary bana deti hai taaki aapko columns khud na kaatne padein: key interface ka naam hai aur value uske fields ki dictionary. MUM-R3 ke liye yeh deti hai:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.3", username="netops", password="NK@2026")
output = conn.send_command("show ip interface brief")
conn.disconnect()
table = parse("show ip interface brief", output)["interface"]
print(type(table))
print(len(table))
print(table["GigabitEthernet0/2"])
for intf, info in table.items():
    print(intf, "-&gt;", info["status"])</pre>
<pre class="out">AUTO&gt; python3 pp.py
&lt;class 'dict'&gt;
4
{'ip_address': '10.3.2.1', 'interface_is_ok': 'YES', 'method': 'manual', 'status': 'down', 'protocol': 'down'}
GigabitEthernet0/0 -&gt; up
GigabitEthernet0/1 -&gt; up
<span class="hl">GigabitEthernet0/2 -&gt; down</span>
GigabitEthernet0/3 -&gt; administratively down</pre>
<p>Teen statuses dikhte hain: <code>up</code>, <code>down</code> (asli link problem: cable ya doosra end) aur <code>administratively down</code> (kisi ne jaan-boojh kar shut kiya). Aapka logic inhe alag treat kare, bilkul chapter 6 ki tarah.</p>
<h3>Shuruaati script</h3>
<pre class="out">     5  ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]   # a list of router IPs
    17      for intf, info in table.items():
    18          pass        # TODO 1: if info["status"] == "up", add 1 to up
    19                      # TODO 2: elif info["status"] == "down", append intf to down
    20      print(f"{name}: {up} interfaces up")
    21      # TODO 3: if the down list is not empty, print a WARNING line</pre>
<pre class="out">AUTO&gt; python3 check_up.py
<span class="hl">MUM-R1: 0 interfaces up</span>
<span class="hl">MUM-R2: 0 interfaces up</span>
<span class="hl">MUM-R3: 0 interfaces up</span>
Check finished</pre>
<p>Script chalta hai aur teeno routers visit karta hai, lekin har count 0 hai kyunki inner loop sirf <code>pass</code> (kuch mat karo) kehta hai. Line 5 router list hai; line 15 aur 16 har router ke liye counter <code>up</code> aur collector <code>down</code> banati hain; line 17 inner loop shuru karti hai.</p>
<h3>TODO 1: up interfaces gino</h3>
<pre class="out">AUTO&gt; edit check_up.py 18         if info["status"] == "up":
AUTO&gt; edit check_up.py 19             up = up + 1</pre>
<pre class="out">AUTO&gt; python3 check_up.py
<span class="hl">MUM-R1: 2 interfaces up</span>
<span class="hl">MUM-R2: 3 interfaces up</span>
<span class="hl">MUM-R3: 2 interfaces up</span>
Check finished</pre>
<p>Indentation yaad rakho: <code>if</code> inner loop ke andar hai (8 spaces) aur <code>up = up + 1</code> <code>if</code> ke andar (12 spaces). Counts 2, 3 aur 2 hain.</p>
<p>Indentation galat ho, jaise increment 8 spaces par rakh do, to Python turant batata hai:</p>
<pre class="out">AUTO&gt; python3 check_up.py
  File "check_up.py", line 19
    up = up + 1
    ^
<span class="hl">IndentationError: expected an indented block after 'if' statement on line 18</span></pre>
<h3>TODO 2 aur 3: down interfaces collect karo aur warn karo</h3>
<pre class="out">AUTO&gt; insert check_up.py 20         elif info["status"] == "down":
AUTO&gt; insert check_up.py 21             down.append(intf)
AUTO&gt; insert check_up.py 24     if len(down) &gt; 0:
AUTO&gt; insert check_up.py 25         print(f"  WARNING {name}: down -&gt; {down}")</pre>
<pre class="out">AUTO&gt; python3 check_up.py
MUM-R1: 2 interfaces up
MUM-R2: 3 interfaces up
MUM-R3: 2 interfaces up
<span class="hl">  WARNING MUM-R3: down -&gt; ['GigabitEthernet0/2']</span>
Check finished</pre>
<p>Ab MUM-R3 flag hota hai: uska <code>GigabitEthernet0/2</code> sach mein down hai. MUM-R1 ka ek port <code>administratively down</code> (jaan-boojh kar shut) hai aur flag nahi hota, kyunki <code>elif</code> exactly <code>"down"</code> maangta hai. Teeno counts jodne par (2 + 3 + 2) poori site par 7 interfaces up aate hain.</p>
<h3>Poora script</h3>
<pre class="code"><span class="c"># check_up.py - visit every router and count the interfaces that are up</span>
from nkmiko import ConnectHandler
from nkparse import parse

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]   <span class="c"># a list of router IPs</span>

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    name = conn.find_prompt().replace("#", "")       <span class="c"># the hostname, e.g. MUM-R1</span>
    output = conn.send_command("show ip interface brief")
    conn.disconnect()
    <span class="c"># parse() turns the text table into a dictionary of interfaces:</span>
    <span class="c"># {"GigabitEthernet0/0": {"ip_address": "10.99.0.1", "status": "up", ...}, ...}</span>
    table = parse("show ip interface brief", output)["interface"]
    up = 0          <span class="c"># counter: interfaces that are up</span>
    down = []       <span class="c"># list: interfaces that are down (link/cable problem)</span>
    for intf, info in table.items():
        if info["status"] == "up":
            up = up + 1
        elif info["status"] == "down":
            down.append(intf)
    print(f"{name}: {up} interfaces up")
    <span class="c"># TODO 3: if the down list is not empty, print a WARNING line</span>
    if len(down) &gt; 0:
        print(f"  WARNING {name}: down -&gt; {down}")

print("Check finished")</pre>
<div class="eg"><p><b>Worked example.</b> Baad mein chautha router check karna ho to uska management IP <code>ROUTERS</code> mein jodo. Aur kuch nahi badalta. Wahi loop, counter aur warning logic use cover karta hai.</p></div>
<div class="warn"><p><b>Common galti.</b> <code>administratively down</code> ko fault ginna. Shut port intentional hai, isliye usper warning noise banati hai. Connection sirf utni der khula rakho jitni zaroorat ho: script text process karne se pehle disconnect karta hai, jo theek hai kyunki text pehle se variable <code>output</code> mein hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Nested loop code padhkar bata sako ki woh kya print karega. Yaad rakho ki parsed output interface name se key hui dictionary hai, aur status field <code>up</code>, <code>down</code> aur <code>administratively down</code> mein fark karta hai.</p></div>
<div class="scn"><h4>Kis router par dead link hai?</h4><p>Power cut ke baad Mumbai NOC ne traffic kam dekha lekin koi device alarm nahi tha. Engineer ne poori site par up-interface script chalayi. Kuch hi seconds mein usne ek WARNING line print ki jo MUM-R3 aur GigabitEthernet0/2 ka naam leti thi. Technician ko loose patch cable mila. List mein aur kuch flag nahi hua, jisse lambi manual khoj bachi.</p><p><b>Lesson:</b> loop, parsed table aur precise condition bhusse mein se sui dhoondh lete hain.</p></div>
<div class="iv"><p class="q">"Kai routers par saare interfaces check karke sirf asli problems kaise report karoge?"</p><p>Device IPs ki list rakho, un par loop chalao, login karo, interface summary command chalao, use interface-keyed dictionary mein parse karo, interfaces par loop chalao aur woh collect karo jinka status exactly down ho (administratively down ignore karte hue). Warning har device ke liye tabhi print karo jab collected list khaali na ho, aur end mein chhota summary print karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device list, loop, parsed dictionary, counter, collector aur if ko jodo.</li>
<li>Status up gino; exactly down fault hai; administratively down intentional hai.</li>
<li>Indentation levels: router loop ke liye 4, interface loop ke liye 8, if ke andar 12.</li>
<li>Router jodna list mein ek naya IP hai.</li>
</ul></div>
`}};export{e as default};