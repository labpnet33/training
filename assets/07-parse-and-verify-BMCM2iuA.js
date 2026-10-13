var e={id:`parse-verify`,h:{en:`Verify, do not hope: parsing output into data`,hi:`Umeed nahi, verify karo: output ko data mein parse karna`},body:{en:`

<p>A script that only prints output has not verified anything; <i>you</i> still have to read it. To let the script decide whether the network is healthy, it must turn the text into <b>data</b> it can test. That is the idea of this chapter.</p>

<h3>Text is for people, data is for programs</h3>
<p>Here is what R2 prints for <code>show ip ospf neighbor</code> once OSPF is up:</p>
<pre class="out">R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:36    10.12.0.1       GigabitEthernet0/1</span>
<span class="hl">3.3.3.3           1   FULL/DR         00:00:40    10.23.0.2       GigabitEthernet0/2</span></pre>
<p>A person sees "two neighbours, both FULL". A program sees one long string. It could search for the word <code>FULL</code> with <code>"FULL" in output</code>, but that is crude: it cannot tell <i>which</i> neighbour or interface. A <b>parser</b> reads the text with fixed rules and builds a <b>dictionary</b>. The lab library <code>nkparse</code> offers <code>parse(command, text)</code> for common show commands. (On real networks the same job is done by the libraries TextFSM, ntc-templates or Cisco pyATS Genie.)</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.2", username="netops", password="NK@2026")
out = conn.send_command("show ip ospf neighbor")
conn.disconnect()
print(out)
data = parse("show ip ospf neighbor", out)
print(data)
print(list(data["interfaces"].keys()))</pre>
<pre class="out">3.3.3.3           1   FULL/DR         00:00:40    10.23.0.2       GigabitEthernet0/2
{'interfaces': {'GigabitEthernet0/1': {'neighbors': {'1.1.1.1': {'neighbor_router_id': '1.1.1.1', 'priority': 1, 'state': 'FULL/BDR', 'dead_time': '00:00:36', 'address': '10.12.0.1'}}}, 'GigabitEthernet0/2': {'neighbors': {'3.3.3.3': {'neighbor_router_id': '3.3.3.3', 'priority': 1, 'state': 'FULL/DR', 'dead_time': '00:00:40', 'address': '10.23.0.2'}}}}}
['GigabitEthernet0/1', 'GigabitEthernet0/2']</pre>
<p>The big line is the whole dictionary printed on one line. Break it into levels, like folders:</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="A parser turns text into nested dictionaries, so a script can ask exact questions of it."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="70" width="140" height="60" rx="10" fill="#fde68a"/><text x="80" y="97" text-anchor="middle" class="svg-ink" font-size="14">raw text</text><text x="80" y="115" text-anchor="middle" class="svg-muted" font-size="12">for human eyes</text><line x1="150" y1="100" x2="215" y2="100" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="182.5" y="92" text-anchor="middle" class="svg-accent" font-size="12">parse()</text><rect x="215" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="270" y="97" text-anchor="middle" class="svg-ink" font-size="14">data</text><text x="270" y="115" text-anchor="middle" class="svg-muted" font-size="12">a dictionary</text><line x1="325" y1="100" x2="360" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="40" x2="360" y2="160" stroke="#64748b" stroke-width="2"/><line x1="360" y1="40" x2="385" y2="40" stroke="#64748b" stroke-width="2"/><line x1="360" y1="160" x2="385" y2="160" stroke="#64748b" stroke-width="2"/><rect x="385" y="15" width="245" height="50" rx="10" fill="#bbf7d0"/><text x="507.5" y="37" text-anchor="middle" class="svg-ink" font-size="14">"interfaces"</text><text x="507.5" y="55" text-anchor="middle" class="svg-muted" font-size="12">GigabitEthernet0/1, Gi0/2</text><rect x="385" y="135" width="245" height="50" rx="10" fill="#ddd6fe"/><text x="507.5" y="157" text-anchor="middle" class="svg-ink" font-size="14">"neighbors"</text><text x="507.5" y="175" text-anchor="middle" class="svg-muted" font-size="12">1.1.1.1 : { "state": "FULL/BDR" }</text><line x1="507" y1="65" x2="507" y2="135" stroke="#64748b" stroke-width="2"/></svg><p class="cap">A parser turns text into nested dictionaries, so a script can ask exact questions of it.</p></div>
<ul>
<li><code>data["interfaces"]</code> is a dictionary whose keys are interface names.</li>
<li><code>data["interfaces"]["GigabitEthernet0/1"]["neighbors"]</code> is a dictionary whose keys are neighbour router IDs.</li>
<li>Each neighbour is a small dictionary with <code>"state"</code>, <code>"address"</code>, <code>"priority"</code> and more. Square brackets with a key read one value: <code>nbr["state"]</code> gives <code>"FULL/BDR"</code>.</li>
<li><code>list(data["interfaces"].keys())</code> lists the keys, which is a good way to explore data you have never seen.</li>
</ul>
<p>A second parser, for <code>show ip interface brief</code>, builds a dictionary of interfaces. Here it is used to print a tidy three-column report:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.2", username="netops", password="NK@2026")
data = parse("show ip interface brief", conn.send_command("show ip interface brief"))
conn.disconnect()
for name, info in data["interface"].items():
    print(name, info["ip_address"], info["status"])</pre>
<pre class="out">AUTO&gt; python3 parseif.py
GigabitEthernet0/0 10.99.0.2 up
GigabitEthernet0/1 10.12.0.2 up
GigabitEthernet0/2 10.23.0.1 up
<span class="hl">GigabitEthernet0/3 unassigned administratively down</span>
Loopback0 2.2.2.2 up</pre>

<h3>Making a decision: if</h3>
<p>An <code>if</code> line runs its indented block only when a test is <b>True</b>. A comparison such as <code>a == b</code> (two equal signs: "is it equal?") gives True or False. Text methods help: <code>text.startswith("FULL")</code> is True when the text begins with FULL.</p>

<h3>The bug that fools beginners</h3>
<p>The Lab 2 verify script counts FULL neighbours across all routers. Its test is <code>nbr["state"] == "FULL"</code>. Run it right after OSPF is configured and again a minute later:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
total = 0

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    out = conn.send_command("show ip ospf neighbor")
    conn.disconnect()
    data = parse("show ip ospf neighbor", out)
    for intf, info in data["interfaces"].items():
        for rid, nbr in info["neighbors"].items():
            if nbr["state"] == "FULL":
                print(ip, "sees", rid, "on", intf, "state", nbr["state"])
                total = total + 1

print("Total FULL neighbours:", total)</pre>
<pre class="out">AUTO&gt; python3 verify.py
<span class="hl">Total FULL neighbours: 0</span></pre>
<p>It says <b>0</b>, even though the routers show neighbours in <code>FULL</code> state. The state is not the word <code>FULL</code>; on a broadcast network it is <code>FULL/DR</code> or <code>FULL/BDR</code> (DR and BDR are the elected roles). <code>"FULL/DR" == "FULL"</code> is False, because <code>==</code> demands the entire text match. The fix is one line:</p>
<pre class="code">            if nbr["state"].startswith("FULL"):</pre>
<pre class="out">AUTO&gt; python3 verify.py
10.99.0.1 sees 2.2.2.2 on GigabitEthernet0/1 state FULL/DR
10.99.0.2 sees 1.1.1.1 on GigabitEthernet0/1 state FULL/BDR
10.99.0.2 sees 3.3.3.3 on GigabitEthernet0/2 state FULL/DR
10.99.0.3 sees 2.2.2.2 on GigabitEthernet0/1 state FULL/BDR
<span class="hl">Total FULL neighbours: 4</span></pre>
<p>Four is the right number: R1 has 1 neighbour, R2 has 2, R3 has 1. Writing the expected number down <i>before</i> you run the script is a good habit; it makes a wrong "0" or "6" obvious. A verification script that is itself wrong is worse than none, because it gives false confidence. Always compare your test with the real output at least once.</p>

<h3>Time matters</h3>
<p>Networks need time to converge. OSPF takes tens of seconds to reach FULL after configuration, going through states such as INIT, 2WAY and EXSTART. A verify run seconds after the push can report 0 for the right reason. The script cannot tell "not yet" from "broken". Either wait and re-check (a loop with <code>time.sleep(10)</code> and a limit on the number of tries) or run the verification as a separate step later.</p>

<div class="eg"><p><b>Worked example.</b> After pushing a new VLAN to 12 switches you want a one-line answer: "12 of 12 have VLAN 30". The script parses <code>show vlan brief</code> on each switch, checks whether the key <code>"30"</code> is in the dictionary, counts the True results and prints "12 of 12". If it prints "11 of 12", you know exactly which switch to inspect, because the loop printed its name.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Testing with <code>==</code> against a partial word. (2) Trusting a verify script you have never seen fail. Break something on purpose and watch it report a problem. (3) Using one equal sign <code>=</code> in a test; that is storing, not comparing. (4) Verifying too early and calling a slow convergence a failure.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam may show parsed output (a dictionary) and ask how to read a value: you chain the keys, <code>data["interfaces"]["GigabitEthernet0/1"]</code>. Know that parsers (TextFSM, Genie) convert CLI text to structured data, and that structured data is easier to test than raw text.</p></div>

<div class="scn"><h4>"It says zero neighbours" at 3 a.m.</h4><p>After a maintenance window the verification script printed 0 FULL neighbours on every router, and the on-call engineer almost rolled the change back. A colleague logged in by hand and saw all neighbours FULL. The script compared the state with the word FULL, but the real states were FULL/DR and FULL/BDR. No change was wrong; the checker was.</p><p><b>Lesson:</b> when automation and a human disagree, test the automation against the real output before you act on it.</p></div>

<div class="iv"><p class="q">"How do you verify that an automated change worked?"</p><p>I collect the state again after the change, parse it into structured data and compare it to an explicit expected result: this neighbour is FULL, this route exists, this interface is up. I allow time for convergence, print which device failed, and test the verifier itself against real output and against a deliberate failure. Verification is part of the change, not an extra.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A parser turns show output into nested dictionaries; you read values by chaining keys.</li>
<li><code>if</code> runs a block when a test is True; <code>==</code> compares, <code>=</code> stores.</li>
<li>OSPF states carry extra text (FULL/DR, FULL/BDR), so use <code>startswith("FULL")</code>.</li>
<li>Write down the expected number before you run a verification script.</li>
<li>Allow convergence time and test your verifier against a real failure.</li>
</ul></div>

`,hi:`

<p>Jo script sirf output print karti hai usne kuch verify nahi kiya; padhna abhi bhi <i>aapko</i> padta hai. Script khud decide kar sake ki network healthy hai ya nahi, uske liye use text ko aisa <b>data</b> banana padta hai jise woh test kar sake. Yahi is chapter ka idea hai.</p>

<h3>Text logon ke liye hai, data programs ke liye</h3>
<p>OSPF up hone par R2 <code>show ip ospf neighbor</code> par yeh print karta hai:</p>
<pre class="out">R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:36    10.12.0.1       GigabitEthernet0/1</span>
<span class="hl">3.3.3.3           1   FULL/DR         00:00:40    10.23.0.2       GigabitEthernet0/2</span></pre>
<p>Insaan dekhta hai "do neighbours, dono FULL". Program ko ek lambi string dikhti hai. Woh <code>"FULL" in output</code> se <code>FULL</code> shabd dhoondh sakta hai, par yeh moti vidhi hai: yeh nahi bata sakti ki <i>kaunsa</i> neighbour ya interface. <b>Parser</b> fixed rules se text padhta hai aur <b>dictionary</b> banata hai. Lab library <code>nkparse</code> common show commands ke liye <code>parse(command, text)</code> deti hai. (Asli networks par yahi kaam TextFSM, ntc-templates ya Cisco pyATS Genie libraries karti hain.)</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.2", username="netops", password="NK@2026")
out = conn.send_command("show ip ospf neighbor")
conn.disconnect()
print(out)
data = parse("show ip ospf neighbor", out)
print(data)
print(list(data["interfaces"].keys()))</pre>
<pre class="out">3.3.3.3           1   FULL/DR         00:00:40    10.23.0.2       GigabitEthernet0/2
{'interfaces': {'GigabitEthernet0/1': {'neighbors': {'1.1.1.1': {'neighbor_router_id': '1.1.1.1', 'priority': 1, 'state': 'FULL/BDR', 'dead_time': '00:00:36', 'address': '10.12.0.1'}}}, 'GigabitEthernet0/2': {'neighbors': {'3.3.3.3': {'neighbor_router_id': '3.3.3.3', 'priority': 1, 'state': 'FULL/DR', 'dead_time': '00:00:40', 'address': '10.23.0.2'}}}}}
['GigabitEthernet0/1', 'GigabitEthernet0/2']</pre>
<p>Bada line poori dictionary hai jo ek line mein print hui. Use folders ki tarah levels mein todo:</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Parser text ko nested dictionaries mein badalta hai, taaki script us se sahi sawaal puch sake."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="70" width="140" height="60" rx="10" fill="#fde68a"/><text x="80" y="97" text-anchor="middle" class="svg-ink" font-size="14">raw text</text><text x="80" y="115" text-anchor="middle" class="svg-muted" font-size="12">for human eyes</text><line x1="150" y1="100" x2="215" y2="100" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="182.5" y="92" text-anchor="middle" class="svg-accent" font-size="12">parse()</text><rect x="215" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="270" y="97" text-anchor="middle" class="svg-ink" font-size="14">data</text><text x="270" y="115" text-anchor="middle" class="svg-muted" font-size="12">ek dictionary</text><line x1="325" y1="100" x2="360" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="40" x2="360" y2="160" stroke="#64748b" stroke-width="2"/><line x1="360" y1="40" x2="385" y2="40" stroke="#64748b" stroke-width="2"/><line x1="360" y1="160" x2="385" y2="160" stroke="#64748b" stroke-width="2"/><rect x="385" y="15" width="245" height="50" rx="10" fill="#bbf7d0"/><text x="507.5" y="37" text-anchor="middle" class="svg-ink" font-size="14">"interfaces"</text><text x="507.5" y="55" text-anchor="middle" class="svg-muted" font-size="12">GigabitEthernet0/1, Gi0/2</text><rect x="385" y="135" width="245" height="50" rx="10" fill="#ddd6fe"/><text x="507.5" y="157" text-anchor="middle" class="svg-ink" font-size="14">"neighbors"</text><text x="507.5" y="175" text-anchor="middle" class="svg-muted" font-size="12">1.1.1.1 : { "state": "FULL/BDR" }</text><line x1="507" y1="65" x2="507" y2="135" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Parser text ko nested dictionaries mein badalta hai, taaki script us se sahi sawaal puch sake.</p></div>
<ul>
<li><code>data["interfaces"]</code> ek dictionary hai jiski keys interface names hain.</li>
<li><code>data["interfaces"]["GigabitEthernet0/1"]["neighbors"]</code> ek dictionary hai jiski keys neighbour router IDs hain.</li>
<li>Har neighbour ek chhoti dictionary hai jisme <code>"state"</code>, <code>"address"</code>, <code>"priority"</code> aur aur bhi hai. Key ke saath square brackets ek value padhte hain: <code>nbr["state"]</code> se <code>"FULL/BDR"</code> milta hai.</li>
<li><code>list(data["interfaces"].keys())</code> keys ki list deta hai, jo aise data ko explore karne ka achha tareeka hai jo aapne kabhi dekha nahi.</li>
</ul>
<p><code>show ip interface brief</code> ke liye doosra parser interfaces ki dictionary banata hai. Yahan use ek saaf teen-column report print karne ke liye use kiya gaya hai:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.2", username="netops", password="NK@2026")
data = parse("show ip interface brief", conn.send_command("show ip interface brief"))
conn.disconnect()
for name, info in data["interface"].items():
    print(name, info["ip_address"], info["status"])</pre>
<pre class="out">AUTO&gt; python3 parseif.py
GigabitEthernet0/0 10.99.0.2 up
GigabitEthernet0/1 10.12.0.2 up
GigabitEthernet0/2 10.23.0.1 up
<span class="hl">GigabitEthernet0/3 unassigned administratively down</span>
Loopback0 2.2.2.2 up</pre>

<h3>Faisla lena: if</h3>
<p><code>if</code> line apna indented block tabhi chalati hai jab test <b>True</b> ho. <code>a == b</code> (do equal sign: "kya barabar hai?") jaisi comparison True ya False deti hai. Text methods madad karte hain: <code>text.startswith("FULL")</code> True hota hai jab text FULL se shuru ho.</p>

<h3>Woh bug jo beginners ko ulta deta hai</h3>
<p>Lab 2 ki verify script saare routers par FULL neighbours ginti hai. Uska test <code>nbr["state"] == "FULL"</code> hai. OSPF configure karne ke turant baad chalao, aur ek minute baad dobara:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
total = 0

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    out = conn.send_command("show ip ospf neighbor")
    conn.disconnect()
    data = parse("show ip ospf neighbor", out)
    for intf, info in data["interfaces"].items():
        for rid, nbr in info["neighbors"].items():
            if nbr["state"] == "FULL":
                print(ip, "sees", rid, "on", intf, "state", nbr["state"])
                total = total + 1

print("Total FULL neighbours:", total)</pre>
<pre class="out">AUTO&gt; python3 verify.py
<span class="hl">Total FULL neighbours: 0</span></pre>
<p>Yeh <b>0</b> bolti hai, jabki routers <code>FULL</code> state mein neighbours dikhate hain. State shabd <code>FULL</code> nahi hai; broadcast network par woh <code>FULL/DR</code> ya <code>FULL/BDR</code> hai (DR aur BDR elected roles hain). <code>"FULL/DR" == "FULL"</code> False hai, kyunki <code>==</code> poora text match maangta hai. Fix ek line ka hai:</p>
<pre class="code">            if nbr["state"].startswith("FULL"):</pre>
<pre class="out">AUTO&gt; python3 verify.py
10.99.0.1 sees 2.2.2.2 on GigabitEthernet0/1 state FULL/DR
10.99.0.2 sees 1.1.1.1 on GigabitEthernet0/1 state FULL/BDR
10.99.0.2 sees 3.3.3.3 on GigabitEthernet0/2 state FULL/DR
10.99.0.3 sees 2.2.2.2 on GigabitEthernet0/1 state FULL/BDR
<span class="hl">Total FULL neighbours: 4</span></pre>
<p>Chaar sahi number hai: R1 ka 1 neighbour hai, R2 ke 2, R3 ka 1. Script chalane se <i>pehle</i> expected number likh lena achhi aadat hai; isse galat "0" ya "6" turant dikh jaata hai. Jo verification script khud galat ho woh na hone se bhi buri hai, kyunki woh jhootha bharosa deti hai. Apna test kam se kam ek baar asli output se compare karo.</p>

<h3>Time matter karta hai</h3>
<p>Networks ko converge hone mein time lagta hai. OSPF ko configuration ke baad FULL tak pahunchne mein das-bees second lagte hain, INIT, 2WAY aur EXSTART jaise states se guzar kar. Push ke kuch second baad ki verify run sahi wajah se 0 bata sakti hai. Script "abhi nahi" aur "toota hua" mein farak nahi kar sakti. Ya to ruko aur dobara check karo (<code>time.sleep(10)</code> aur tries ki limit wala loop) ya verification ko baad ke alag step ke roop mein chalao.</p>

<div class="eg"><p><b>Worked example.</b> 12 switches par naya VLAN push karne ke baad aapko ek line ka jawab chahiye: "12 mein se 12 par VLAN 30 hai". Script har switch par <code>show vlan brief</code> parse karti hai, check karti hai ki key <code>"30"</code> dictionary mein hai ya nahi, True results ginti hai aur "12 of 12" print karti hai. "11 of 12" aaye to aap jaante ho ki kaunsa switch dekhna hai, kyunki loop ne uska naam print kiya tha.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Adhoore shabd ke saath <code>==</code> se test karna. (2) Aisi verify script par bharosa karna jise aapne kabhi fail hote nahi dekha. Jaanbujhkar kuch todo aur dekho ki woh problem report karti hai. (3) Test mein ek equal sign <code>=</code> use karna; woh store karna hai, compare karna nahi. (4) Bahut jaldi verify karke dheemi convergence ko failure bol dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam parsed output (dictionary) dikha kar poochh sakta hai ki value kaise padhte hain: aap keys ko chain karte ho, <code>data["interfaces"]["GigabitEthernet0/1"]</code>. Jaano ki parsers (TextFSM, Genie) CLI text ko structured data mein badalte hain, aur structured data ko test karna raw text se aasan hai.</p></div>

<div class="scn"><h4>Raat 3 baje "zero neighbours"</h4><p>Maintenance window ke baad verification script ne har router par 0 FULL neighbours print kiye, aur on-call engineer ne lagbhag change rollback kar diya. Ek colleague ne haath se login kiya aur saare neighbours FULL dekhe. Script ne state ko shabd FULL se compare kiya tha, par asli states FULL/DR aur FULL/BDR the. Koi change galat nahi tha; checker galat tha.</p><p><b>Lesson:</b> jab automation aur insaan mein asehmati ho, to koi action lene se pehle automation ko asli output ke saamne test karo.</p></div>

<div class="iv"><p class="q">"Automated change kaam kiya ya nahi, yeh kaise verify karoge?"</p><p>Main change ke baad state dobara collect karta hoon, use structured data mein parse karta hoon aur ek explicit expected result se compare karta hoon: yeh neighbour FULL hai, yeh route maujood hai, yeh interface up hai. Main convergence ke liye time deta hoon, print karta hoon ki kaunsa device fail hua, aur verifier ko khud asli output aur jaanbujhkar ki gayi failure ke saamne test karta hoon. Verification change ka hissa hai, extra nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parser show output ko nested dictionaries mein badalta hai; aap keys chain karke values padhte ho.</li>
<li><code>if</code> test True hone par block chalata hai; <code>==</code> compare karta hai, <code>=</code> store karta hai.</li>
<li>OSPF states mein extra text hota hai (FULL/DR, FULL/BDR), isliye <code>startswith("FULL")</code> use karo.</li>
<li>Verification script chalane se pehle expected number likh lo.</li>
<li>Convergence time do aur apne verifier ko asli failure ke saamne test karo.</li>
</ul></div>

`}};export{e as default};