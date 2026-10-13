var e={id:`push-config`,h:{en:`Changing configuration: send_config_set and dictionaries`,hi:`Configuration badalna: send_config_set aur dictionaries`},body:{en:`

<p>Reading is safe. Changing is where scripts earn their keep, and also where they can hurt. This chapter shows how to send configuration, how to give <b>different</b> lines to different routers, and how to save the result.</p>

<h3>send_config_set: configuration lines as a list</h3>
<p>On the CLI you type <code>configure terminal</code>, then lines, then <code>end</code>. <code>send_config_set()</code> does all three for you. You give it a <b>list</b> of lines in square brackets, one string per line:</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
lines = ["interface Loopback5", "description Added by Python"]
output = conn.send_config_set(lines)
print(output)
print(conn.send_command("show running-config interface Loopback5"))
conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 cfgdemo.py
configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)#interface Loopback5
<span class="hl">R1(config-if)#description Added by Python</span>
R1(config-if)#end
R1#
Building configuration...

Current configuration : 49 bytes
!
interface Loopback5
<span class="hl"> description Added by Python</span>
end</pre>
<p>The first block is what <code>send_config_set()</code> <b>returns</b>: a transcript of the session, with the prompts <code>R1(config)#</code> and <code>R1(config-if)#</code> that you know. Python does not "understand" the configuration; it types it. The second block is the answer to our own <code>show running-config interface Loopback5</code>, which confirms the line is now on the router. That is the verify step in miniature.</p>
<ul>
<li>The order of the list is the order of the commands. <code>interface Loopback5</code> comes first so that <code>description</code> applies to it.</li>
<li>Each string is one line exactly as you would type it. Do not add <code>configure terminal</code> or <code>end</code>; the method adds them.</li>
<li>If the router rejects a line, it prints an <code>% Invalid input</code> message <i>inside the returned text</i>; Python does not raise an error. You must read the text (or verify afterwards).</li>
</ul>

<h3>save_config: write memory</h3>
<p>On IOS, the running configuration is lost at reload unless it is saved. <code>conn.save_config()</code> sends <code>write memory</code>:</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
conn.send_config_set(["interface Loopback5", "description Added by Python"])
print(conn.save_config())
conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 savecfg.py
write mem
Building configuration...
<span class="hl">[OK]</span>
R1#</pre>
<p>Save only after you have verified the change. A saved mistake survives a reboot.</p>

<h3>A different list for every router: the dictionary</h3>
<p>For the same change on every router a list of IPs is enough. But OSPF needs different <code>network</code> lines on each router, because each router has different interfaces. For that we use a <b>dictionary</b>: pairs of <b>key</b> and <b>value</b> inside curly brackets, written <code>key: value</code>. Think of an ARP table, where an IP (key) points to a MAC (value). Here the key is the router's IP and the value is its list of lines.</p>
<pre class="code">from nkmiko import ConnectHandler

# PLAN: key = management IP, value = the list of lines for that router
PLAN = {
    "10.99.0.1": ["router ospf 1", "network 1.1.1.1 0.0.0.0 area 0", "network 10.12.0.0 0.0.0.3 area 0"],
    "10.99.0.2": ["router ospf 1", "network 2.2.2.2 0.0.0.0 area 0", "network 10.12.0.0 0.0.0.3 area 0", "network 10.23.0.0 0.0.0.3 area 0"],
    "10.99.0.3": ["router ospf 1", "network 3.3.3.3 0.0.0.0 area 0", "network 10.23.0.0 0.0.0.3 area 0"],
}

for ip, lines in PLAN.items():
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    conn.send_config_set(lines)
    conn.save_config()
    conn.disconnect()
    print("OSPF pushed to", ip)</pre>
<ul>
<li><code>PLAN = { ... }</code> is one variable that holds three entries. The comma at the end of each entry matters.</li>
<li><code>PLAN.items()</code> gives the pairs, and <code>for ip, lines in ...</code> unpacks each pair into two variables.</li>
<li>The <code>network 1.1.1.1 0.0.0.0 area 0</code> lines use a <b>wildcard mask</b> (the inverse of a subnet mask) to say "enable OSPF on the interface that owns exactly this address". You learned this in the OSPF module.</li>
<li>The <code>#</code> line is a <b>comment</b>: Python ignores everything after <code>#</code>. Comments are for people.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="A dictionary gives each router its own list of configuration lines; the loop sends each list to its router."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="20" width="250" height="160" rx="10" fill="#fde68a"/><text x="135" y="105" text-anchor="middle" class="svg-ink" font-size="14">PLAN = { ... }</text><text x="135" y="70" text-anchor="middle" class="svg-ink" font-size="12">"10.99.0.1"  :  [ line, line, ... ]</text><text x="135" y="100" text-anchor="middle" class="svg-ink" font-size="12">"10.99.0.2"  :  [ line, line, ... ]</text><text x="135" y="130" text-anchor="middle" class="svg-ink" font-size="12">"10.99.0.3"  :  [ line, line, ... ]</text><text x="135" y="160" text-anchor="middle" class="svg-accent" font-size="12">key : value</text><line x1="260" y1="100" x2="340" y2="100" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="340" y="40" width="140" height="56" rx="10" fill="#bae6fd"/><text x="410" y="65" text-anchor="middle" class="svg-ink" font-size="14">for ip, lines</text><text x="410" y="83" text-anchor="middle" class="svg-muted" font-size="12">in PLAN.items()</text><rect x="340" y="120" width="140" height="56" rx="10" fill="#bbf7d0"/><text x="410" y="153" text-anchor="middle" class="svg-ink" font-size="14">send_config_set(lines)</text><line x1="410" y1="96" x2="410" y2="120" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="480" y1="148" x2="540" y2="148" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="540" y="120" width="90" height="56" rx="10" fill="#ddd6fe"/><text x="585" y="145" text-anchor="middle" class="svg-ink" font-size="14">router</text><text x="585" y="163" text-anchor="middle" class="svg-muted" font-size="12">save_config</text></svg><p class="cap">A dictionary gives each router its own list of configuration lines; the loop sends each list to its router.</p></div>

<h3>Run it, and see what a missing entry does</h3>
<p>The Lab 2 starter script has the entries for R1 and R2 but not for R3. When we run it, the loop is perfectly happy; it only visits the keys that exist:</p>
<pre class="out">AUTO&gt; python3 ospfpush.py   (R3 entry missing)
OSPF pushed to 10.99.0.1
OSPF pushed to 10.99.0.2</pre>
<p>Only two routers received OSPF. No error appears, because nothing is wrong from Python's point of view. After adding the R3 entry and running again:</p>
<pre class="out">AUTO&gt; python3 ospfpush.py
OSPF pushed to 10.99.0.1
OSPF pushed to 10.99.0.2
<span class="hl">OSPF pushed to 10.99.0.3</span></pre>
<p>Running the script a second time sent the same lines to R1 and R2 again. This is harmless in IOS: re-entering a command that already exists changes nothing. A change that can be repeated safely is called <b>idempotent</b>, and it is a quality to aim for in every automation script.</p>

<div class="eg"><p><b>Worked example.</b> A bank has a new syslog server 198.51.100.50. The change is the same on every router: one line, <code>logging host 198.51.100.50</code>. The script loops over a list of routers and sends a one-item list to each. The 300 routers are done in a few minutes. If instead the change differs per router, such as OSPF network statements, a dictionary holds each router's own lines.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Passing one string instead of a list to <code>send_config_set</code>; it expects a list of lines (a single string with line breaks is also accepted, but the list is clearer). (2) Typing <code>configure terminal</code> inside the list. (3) Forgetting a comma between dictionary entries, which is a SyntaxError. (4) Calling <code>save_config()</code> before verifying.</p></div>
<div class="exam"><p><b>Exam trap.</b> The library does not stop on an invalid command. The router's error text appears in the returned output and the script carries on. That is why verification matters. Also: <code>send_command</code> is for show commands; <code>send_config_set</code> is for configuration mode.</p></div>

<div class="scn"><h4>The typo that was never an error</h4><p>An engineer pushed <code>ip route 10.10.10.0 255.255.255.0 10.99.0.254</code> to 20 routers from a dictionary. At one site the line had been typed <code>ip rout ...</code>. The script printed "done" for all 20. Nineteen sites worked; the misspelled one had no route. Reading the returned text for "% Invalid input" would have caught it in the first run.</p><p><b>Lesson:</b> check the returned output for router errors and verify the result, every time.</p></div>

<div class="iv"><p class="q">"How do you push different configuration to different devices from one script?"</p><p>I keep a dictionary that maps each device to its own list of configuration lines (or generate the lines from a template and a data file). The loop connects to each device, calls <code>send_config_set</code> with that device's list, checks the returned text for errors, saves only after verification, and disconnects. I make the change idempotent so a re-run is safe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>send_config_set(list_of_lines)</code> enters configuration mode, sends each line and leaves.</li>
<li>It returns the session transcript; router errors appear in that text, not as Python errors.</li>
<li>A dictionary maps each router to its own lines; <code>for ip, lines in PLAN.items()</code> loops over it.</li>
<li><code>save_config()</code> is <code>write memory</code>; use it after verification.</li>
<li>Prefer idempotent changes that are safe to run twice.</li>
</ul></div>

`,hi:`

<p>Padhna safe hai. Badalna woh jagah hai jahan scripts apna kaam dikhati hain, aur jahan nuksaan bhi kar sakti hain. Yeh chapter dikhata hai ki configuration kaise bhejte hain, alag routers ko <b>alag</b> lines kaise dete hain, aur result save kaise karte hain.</p>

<h3>send_config_set: configuration lines list ke roop mein</h3>
<p>CLI par aap <code>configure terminal</code>, phir lines, phir <code>end</code> type karte ho. <code>send_config_set()</code> teeno aapke liye karta hai. Aap use square brackets mein lines ki <b>list</b> dete ho, har line ek string:</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
lines = ["interface Loopback5", "description Added by Python"]
output = conn.send_config_set(lines)
print(output)
print(conn.send_command("show running-config interface Loopback5"))
conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 cfgdemo.py
configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)#interface Loopback5
<span class="hl">R1(config-if)#description Added by Python</span>
R1(config-if)#end
R1#
Building configuration...

Current configuration : 49 bytes
!
interface Loopback5
<span class="hl"> description Added by Python</span>
end</pre>
<p>Pehla block woh hai jo <code>send_config_set()</code> <b>return</b> karta hai: session ka transcript, un prompts ke saath jo aap jaante ho, <code>R1(config)#</code> aur <code>R1(config-if)#</code>. Python configuration ko "samajhta" nahi; woh use type karta hai. Doosra block hamare apne <code>show running-config interface Loopback5</code> ka jawab hai, jo confirm karta hai ki line ab router par hai. Yahi verify step chhote roop mein hai.</p>
<ul>
<li>List ka order hi commands ka order hai. <code>interface Loopback5</code> pehle aata hai taaki <code>description</code> usi par lage.</li>
<li>Har string ek line hai bilkul waise jaise aap type karte. <code>configure terminal</code> ya <code>end</code> mat jodo; method khud jodta hai.</li>
<li>Router koi line reject kare to woh <i>return hue text ke andar</i> <code>% Invalid input</code> message print karta hai; Python error raise nahi karta. Aapko text padhna hoga (ya baad mein verify karna hoga).</li>
</ul>

<h3>save_config: write memory</h3>
<p>IOS par running configuration reload par chali jaati hai jab tak save na ho. <code>conn.save_config()</code> <code>write memory</code> bhejta hai:</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
conn.send_config_set(["interface Loopback5", "description Added by Python"])
print(conn.save_config())
conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 savecfg.py
write mem
Building configuration...
<span class="hl">[OK]</span>
R1#</pre>
<p>Save sirf change verify karne ke baad karo. Save ki hui galti reboot ke baad bhi rehti hai.</p>

<h3>Har router ke liye alag list: dictionary</h3>
<p>Har router par ek jaisa change ho to IPs ki list kaafi hai. Par OSPF ko har router par alag <code>network</code> lines chahiye, kyunki har router ke interfaces alag hain. Iske liye hum <b>dictionary</b> use karte hain: curly brackets ke andar <b>key</b> aur <b>value</b> ke jode, <code>key: value</code> likhe hue. ARP table socho, jahan IP (key) MAC (value) ki taraf ishaara karta hai. Yahan key router ka IP hai aur value uski lines ki list.</p>
<pre class="code">from nkmiko import ConnectHandler

# PLAN: key = management IP, value = the list of lines for that router
PLAN = {
    "10.99.0.1": ["router ospf 1", "network 1.1.1.1 0.0.0.0 area 0", "network 10.12.0.0 0.0.0.3 area 0"],
    "10.99.0.2": ["router ospf 1", "network 2.2.2.2 0.0.0.0 area 0", "network 10.12.0.0 0.0.0.3 area 0", "network 10.23.0.0 0.0.0.3 area 0"],
    "10.99.0.3": ["router ospf 1", "network 3.3.3.3 0.0.0.0 area 0", "network 10.23.0.0 0.0.0.3 area 0"],
}

for ip, lines in PLAN.items():
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    conn.send_config_set(lines)
    conn.save_config()
    conn.disconnect()
    print("OSPF pushed to", ip)</pre>
<ul>
<li><code>PLAN = { ... }</code> ek variable hai jisme teen entries hain. Har entry ke end ka comma zaroori hai.</li>
<li><code>PLAN.items()</code> jode deta hai, aur <code>for ip, lines in ...</code> har jode ko do variables mein kholta hai.</li>
<li><code>network 1.1.1.1 0.0.0.0 area 0</code> lines <b>wildcard mask</b> (subnet mask ka ulta) use karti hain yeh kehne ke liye "us interface par OSPF chalu karo jiska address bilkul yahi hai". Yeh aapne OSPF module mein seekha.</li>
<li><code>#</code> wali line <b>comment</b> hai: Python <code>#</code> ke baad ka sab kuch ignore karta hai. Comments logon ke liye hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Dictionary har router ko uski apni configuration lines ki list deti hai; loop har list ko uske router ko bhejta hai."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="20" width="250" height="160" rx="10" fill="#fde68a"/><text x="135" y="105" text-anchor="middle" class="svg-ink" font-size="14">PLAN = { ... }</text><text x="135" y="70" text-anchor="middle" class="svg-ink" font-size="12">"10.99.0.1"  :  [ line, line, ... ]</text><text x="135" y="100" text-anchor="middle" class="svg-ink" font-size="12">"10.99.0.2"  :  [ line, line, ... ]</text><text x="135" y="130" text-anchor="middle" class="svg-ink" font-size="12">"10.99.0.3"  :  [ line, line, ... ]</text><text x="135" y="160" text-anchor="middle" class="svg-accent" font-size="12">key : value</text><line x1="260" y1="100" x2="340" y2="100" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="340" y="40" width="140" height="56" rx="10" fill="#bae6fd"/><text x="410" y="65" text-anchor="middle" class="svg-ink" font-size="14">for ip, lines</text><text x="410" y="83" text-anchor="middle" class="svg-muted" font-size="12">in PLAN.items()</text><rect x="340" y="120" width="140" height="56" rx="10" fill="#bbf7d0"/><text x="410" y="153" text-anchor="middle" class="svg-ink" font-size="14">send_config_set(lines)</text><line x1="410" y1="96" x2="410" y2="120" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="480" y1="148" x2="540" y2="148" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="540" y="120" width="90" height="56" rx="10" fill="#ddd6fe"/><text x="585" y="145" text-anchor="middle" class="svg-ink" font-size="14">router</text><text x="585" y="163" text-anchor="middle" class="svg-muted" font-size="12">save_config</text></svg><p class="cap">Dictionary har router ko uski apni configuration lines ki list deti hai; loop har list ko uske router ko bhejta hai.</p></div>

<h3>Chalao, aur dekho ki missing entry kya karti hai</h3>
<p>Lab 2 ki starter script mein R1 aur R2 ki entries hain par R3 ki nahi. Chalane par loop bilkul khush rehta hai; woh sirf wahi keys visit karta hai jo maujood hain:</p>
<pre class="out">AUTO&gt; python3 ospfpush.py   (R3 entry missing)
OSPF pushed to 10.99.0.1
OSPF pushed to 10.99.0.2</pre>
<p>Sirf do routers ko OSPF mila. Koi error nahi aata, kyunki Python ki nazar mein kuch galat nahi hai. R3 ki entry jodkar dobara chalane par:</p>
<pre class="out">AUTO&gt; python3 ospfpush.py
OSPF pushed to 10.99.0.1
OSPF pushed to 10.99.0.2
<span class="hl">OSPF pushed to 10.99.0.3</span></pre>
<p>Script doosri baar chalane se R1 aur R2 ko wahi lines dobara gayi. IOS mein yeh nuksaan nahi karta: jo command pehle se hai use dobara daalne se kuch nahi badalta. Jo change surakshit tareeke se dohraya ja sake use <b>idempotent</b> kehte hain, aur har automation script mein yahi gun chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Ek bank ka naya syslog server 198.51.100.50 hai. Change har router par ek jaisa hai: ek line, <code>logging host 198.51.100.50</code>. Script routers ki list par loop chalati hai aur har ek ko ek-item ki list bhejti hai. 300 routers kuch minute mein ho jaate hain. Agar change har router par alag ho, jaise OSPF network statements, to dictionary har router ki apni lines rakhti hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) <code>send_config_set</code> ko list ki jagah ek string dena; yeh lines ki list expect karta hai (line breaks wali ek string bhi chalti hai, par list zyada saaf hai). (2) List ke andar <code>configure terminal</code> type karna. (3) Dictionary entries ke beech comma bhool jaana, jo SyntaxError hai. (4) Verify karne se pehle <code>save_config()</code> call karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Library invalid command par rukti nahi. Router ka error text return hue output mein aata hai aur script aage chalti rehti hai. Isiliye verification zaroori hai. Aur: <code>send_command</code> show commands ke liye hai; <code>send_config_set</code> configuration mode ke liye.</p></div>

<div class="scn"><h4>Woh typo jo kabhi error bana hi nahi</h4><p>Ek engineer ne dictionary se 20 routers par <code>ip route 10.10.10.0 255.255.255.0 10.99.0.254</code> push kiya. Ek site par line <code>ip rout ...</code> type ho gayi thi. Script ne 20 ke liye "done" print kiya. Unnis sites chale; jis site ki spelling galat thi uske paas route nahi tha. Return hue text mein "% Invalid input" dhoondhne se pehli hi run mein pakad mein aa jaata.</p><p><b>Lesson:</b> return hue output mein router errors check karo aur har baar result verify karo.</p></div>

<div class="iv"><p class="q">"Ek script se alag devices ko alag configuration kaise push karoge?"</p><p>Main ek dictionary rakhta hoon jo har device ko uski apni configuration lines ki list se map karti hai (ya template aur data file se lines generate karta hoon). Loop har device se connect hota hai, us device ki list ke saath <code>send_config_set</code> call karta hai, return hue text mein errors check karta hai, verification ke baad hi save karta hai, aur disconnect karta hai. Main change ko idempotent banata hoon taaki re-run safe rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>send_config_set(list_of_lines)</code> configuration mode mein jaata hai, har line bhejta hai aur nikal aata hai.</li>
<li>Yeh session transcript return karta hai; router errors us text mein aate hain, Python errors ke roop mein nahi.</li>
<li>Dictionary har router ko uski apni lines se map karti hai; <code>for ip, lines in PLAN.items()</code> uspar loop chalata hai.</li>
<li><code>save_config()</code> yaani <code>write memory</code>; verification ke baad use karo.</li>
<li>Idempotent changes pasand karo jo do baar chalane par safe hon.</li>
</ul></div>

`}};export{e as default};