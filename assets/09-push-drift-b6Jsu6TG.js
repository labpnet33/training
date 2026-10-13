var e={id:`push-drift`,h:{en:`Push, verify, write back and catch drift`,hi:`Push, verify, write back aur drift pakadna`},body:{en:`
<p>A render is only a proposal. A real automation closes the loop: it reads intent from NetBox, applies it to the device, checks that the device now matches, and records the result. Then, tomorrow, it asks again whether anything changed behind its back. This is the life cycle in <code>push.py</code> and <code>drift.py</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Loop of render, push, verify, write back, drift check">
<rect x="10" y="60" width="100" height="45" rx="10" fill="#bae6fd"/><text x="60" y="87" text-anchor="middle" class="svg-ink" font-size="13">Render</text>
<rect x="135" y="60" width="100" height="45" rx="10" fill="#bbf7d0"/><text x="185" y="87" text-anchor="middle" class="svg-ink" font-size="13">Push</text>
<rect x="260" y="60" width="100" height="45" rx="10" fill="#bbf7d0"/><text x="310" y="87" text-anchor="middle" class="svg-ink" font-size="13">Verify</text>
<rect x="385" y="60" width="110" height="45" rx="10" fill="#fde68a"/><text x="440" y="87" text-anchor="middle" class="svg-ink" font-size="13">Write back</text>
<rect x="520" y="60" width="110" height="45" rx="10" fill="#fed7aa"/><text x="575" y="87" text-anchor="middle" class="svg-ink" font-size="13">Drift check</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="82" x2="135" y2="82"/><line x1="235" y1="82" x2="260" y2="82"/><line x1="360" y1="82" x2="385" y2="82"/><line x1="495" y1="82" x2="520" y2="82"/></g>
<path d="M575 105 C575 150 60 150 60 105" stroke="#64748b" stroke-width="2" fill="none" stroke-dasharray="5 4"/>
<text x="318" y="145" text-anchor="middle" class="svg-ink" font-size="11">on drift, render and push again</text>
</svg><p class="cap">The loop closes when the device is checked against NetBox, not against your memory of what you pushed.</p></div>

<h3>Push with netmiko</h3>
<p>You met netmiko in adv-nkmiko. Here the connection details come from the data: the host is the device's <code>primary_ip4</code>, the device type is <code>cisco_xe</code>, and the username and password come from the environment. The lines to send are the rendered configuration.</p>
<pre class="code">"""push.py - render a device from NetBox, push it with netmiko, verify, then record the result in NetBox"""
import os
import sys

from netmiko import ConnectHandler

from nbconn import api
from render import build, facts

NAME = sys.argv[1] if len(sys.argv) &gt; 1 else "PUN-CORE-R1"
nb = api()
dev = nb.dcim.devices.get(name=NAME)
host = str(dev.primary_ip4).split("/")[0]
lines = build(nb, NAME)
print("%s: %d lines rendered from NetBox, pushing to %s" % (NAME, len(lines), host))

conn = ConnectHandler(device_type="cisco_xe", host=host,
                      username=os.environ["DEVICE_USER"], password=os.environ["DEVICE_PASSWORD"])
conn.send_config_set(lines)
brief = conn.send_command("show ip interface brief", use_textfsm=True)
conn.disconnect()

state = {row["interface"]: (row["ip_address"], row["status"], row["proto"]) for row in brief}
bad = 0
for i in facts(nb, NAME)["interfaces"]:
    ip, status, proto = state.get(i["name"], ("missing", "-", "-"))
    ok = ip == i["address"] and status == "up" and proto == "up"
    bad += 0 if ok else 1
    print("  %-4s %-18s %-15s %s/%s" % ("OK" if ok else "FAIL", i["name"], ip, status, proto))
if bad:
    sys.exit("%s: %d interface(s) differ from NetBox" % (NAME, bad))

nb.dcim.devices.update([{"id": dev.id, "custom_fields": {"monitored": True},
                         "comments": "configuration pushed from NetBox data by push.py"}])
print("NetBox updated:", NAME, "monitored=True")</pre>

<h3>Verify against the data</h3>
<p>After the push, the script runs <code>show ip interface brief</code> with <code>use_textfsm=True</code>, which returns a list of dictionaries instead of text, and compares each addressed interface with what NetBox said. An interface is OK only when the address matches <i>and</i> status and protocol are both up. Exit codes are for the pipeline: a mismatch ends the script with a non-zero code before anything is written back.</p>
<pre class="out">AUTO01$ python3 push.py
PUN-CORE-R1: 19 lines rendered from NetBox, pushing to 10.99.0.1
  OK   GigabitEthernet0/0 10.99.0.1       up/up
  OK   GigabitEthernet0/1 172.31.10.1     up/up
  OK   Loopback0          1.1.1.1         up/up
NetBox updated: PUN-CORE-R1 monitored=True</pre>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     172.31.10.1     YES manual up                    up
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up</pre>
<p>The second box is the router itself, the source of the "OK" lines. Never report success from the script's own output of what it sent; always read the device back.</p>

<h3>Write back</h3>
<p>The last two lines of <code>push.py</code> update NetBox: the custom field <code>monitored</code> becomes true and a comment records what happened. NetBox now answers "which devices have been configured from data?", and the change log says when. Note the shape again: <code>update([{"id": dev.id, ...}])</code>, a list with the id. Chapter 5 explained why the labs write that way.</p>

<h3>Drift: when the device and NetBox disagree</h3>
<p>Drift is the gap between the declared intent (NetBox) and the actual state (the device). It appears when someone fixes something at the console at three in the morning and forgets to update NetBox. <code>drift.py</code> checks only addresses, which is enough to teach the idea, and uses its exit code as the signal.</p>
<pre class="out">AUTO01$ python3 drift.py; echo "exit code: $?"
PUN-CORE-R1: 3 addressed interfaces in NetBox
drift: 0
exit code: 0</pre>
<p>Now somebody changes Loopback0 on R1 by hand (Lab 1, task 6). The same script:</p>
<pre class="out">AUTO01$ python3 drift.py; echo "exit code: $?"
PUN-CORE-R1: 3 addressed interfaces in NetBox
<span class="hl">DRIFT Loopback0: NetBox 1.1.1.1, device 1.1.1.9</span>
drift: 1
exit code: 1</pre>
<p>It names the interface, shows both values, counts the drift and exits with 1, so a scheduler or a CI job can alert on it. Which side is right? That is a decision for people. In this module NetBox wins: the data is the intent, and the device is repaired by pushing again.</p>
<pre class="out">AUTO01$ python3 push.py
PUN-CORE-R1: 19 lines rendered from NetBox, pushing to 10.99.0.1
  OK   GigabitEthernet0/0 10.99.0.1       up/up
  OK   GigabitEthernet0/1 172.31.10.1     up/up
  OK   Loopback0          1.1.1.1         up/up</pre>
<pre class="out">AUTO01$ python3 drift.py; echo "exit code: $?"
PUN-CORE-R1: 3 addressed interfaces in NetBox
drift: 0
exit code: 0</pre>
<pre class="out">R1# show running-config | section ospf
router ospf 1
 network 10.99.0.0 0.0.0.255 area 0
 network 172.31.10.0 0.0.0.3 area 0
 network 1.1.1.1 0.0.0.0 area 0</pre>
<p>The re-push put Loopback0 back to 1.1.1.1 and the drift check is clean again. Pushing the same configuration twice is safe because the lines are declarative: <code>ip address</code> replaces the old one, and an OSPF <code>network</code> statement that already exists changes nothing. That property is what makes "push on a schedule" a reasonable plan.</p>

<h3>Where this goes next</h3>
<p>One script per device is fine for two routers and painful for two hundred. The next module, adv-nornir, plugs NetBox in as the inventory with <code>nornir_netbox</code>, so one run covers every device a filter selects, in parallel. What you learned here, facts from NetBox, render, push, verify, stays the same; only the loop moves into the framework. That is a forward pointer only; nothing in this chapter needs Nornir.</p>

<div class="warn"><p><b>Common mistake.</b> Pushing before reading the render. Print the lines (or diff them against <code>show running-config</code>) at least once for every new template. The check costs ten seconds and has saved many outages.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>send_config_set</code> pushes lines but does not save them. Without <code>write memory</code> (or <code>save_config()</code>), a reload loses the change. Decide deliberately whether your workflow saves.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> R1 is a lab IOS XE; <code>show ip interface brief</code>, <code>send_config_set</code> and TextFSM parsing behave as shown. Real routers differ in banner and prompt details, may ask for confirmation on some commands, and take longer to apply a large configuration, so use realistic timeouts. Real devices also need the SSH user to have privilege 15 or an enable secret; the lab uses privilege 15.</p></div>

<div class="scn"><h4>The loopback nobody told NetBox about</h4><p>During a night maintenance an engineer changed a loopback on a core router to test a route-reflector design, then forgot. A week later the routing team generated a prefix list from NetBox and filtered out the new address. The drift job, which should have caught it, had been disabled because it "kept failing". The failures were the point.</p><p><b>Lesson:</b> an alarm that annoys you is working. Fix the cause or decide which side is right; do not mute it.</p></div>
<div class="iv"><p class="q">"What is configuration drift and how do you detect it from NetBox?"</p><p>Drift is when the running state of a device no longer matches the intent recorded in the source of truth. I read the intended addresses from NetBox, read the actual ones from the device with TextFSM, list the differences and exit non-zero if there are any. Repair is a re-push from NetBox, or an update of NetBox if the manual change was correct.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Render, push, verify on the device, write back, then check drift.</li>
<li>Connect to the device with the data: <code>primary_ip4</code> for the host, secrets from the environment.</li>
<li>Use TextFSM to compare facts, not text, and exit non-zero on mismatch.</li>
<li>Re-pushing a declarative configuration is safe and repairs drift.</li>
<li>adv-nornir (next) uses NetBox as its inventory for many devices at once.</li></ul></div>`,hi:`
<p>Render sirf ek prastav hai. Asli automation loop band karti hai: NetBox se intent padhti hai, use device par lagati hai, check karti hai ki device ab match karta hai, aur result record karti hai. Phir kal woh dobara poochti hai ki peeth peeche kuch badla to nahi. <code>push.py</code> aur <code>drift.py</code> ka life cycle yahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Render, push, verify, write back, drift check ka loop">
<rect x="10" y="60" width="100" height="45" rx="10" fill="#bae6fd"/><text x="60" y="87" text-anchor="middle" class="svg-ink" font-size="13">Render</text>
<rect x="135" y="60" width="100" height="45" rx="10" fill="#bbf7d0"/><text x="185" y="87" text-anchor="middle" class="svg-ink" font-size="13">Push</text>
<rect x="260" y="60" width="100" height="45" rx="10" fill="#bbf7d0"/><text x="310" y="87" text-anchor="middle" class="svg-ink" font-size="13">Verify</text>
<rect x="385" y="60" width="110" height="45" rx="10" fill="#fde68a"/><text x="440" y="87" text-anchor="middle" class="svg-ink" font-size="13">Write back</text>
<rect x="520" y="60" width="110" height="45" rx="10" fill="#fed7aa"/><text x="575" y="87" text-anchor="middle" class="svg-ink" font-size="13">Drift check</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="82" x2="135" y2="82"/><line x1="235" y1="82" x2="260" y2="82"/><line x1="360" y1="82" x2="385" y2="82"/><line x1="495" y1="82" x2="520" y2="82"/></g>
<path d="M575 105 C575 150 60 150 60 105" stroke="#64748b" stroke-width="2" fill="none" stroke-dasharray="5 4"/>
<text x="318" y="145" text-anchor="middle" class="svg-ink" font-size="11">drift mile to dobara render aur push</text>
</svg><p class="cap">Loop tab band hota hai jab device ko NetBox se check karo, apni yaad se nahi ki aapne kya push kiya.</p></div>

<h3>netmiko se push</h3>
<p>netmiko aap adv-nkmiko mein mil chuke ho. Yahan connection ki details data se aati hain: host device ka <code>primary_ip4</code> hai, device type <code>cisco_xe</code> hai, aur username aur password environment se aate hain. Bhejne wali lines rendered configuration hain.</p>
<pre class="code">"""push.py - render a device from NetBox, push it with netmiko, verify, then record the result in NetBox"""
import os
import sys

from netmiko import ConnectHandler

from nbconn import api
from render import build, facts

NAME = sys.argv[1] if len(sys.argv) &gt; 1 else "PUN-CORE-R1"
nb = api()
dev = nb.dcim.devices.get(name=NAME)
host = str(dev.primary_ip4).split("/")[0]
lines = build(nb, NAME)
print("%s: %d lines rendered from NetBox, pushing to %s" % (NAME, len(lines), host))

conn = ConnectHandler(device_type="cisco_xe", host=host,
                      username=os.environ["DEVICE_USER"], password=os.environ["DEVICE_PASSWORD"])
conn.send_config_set(lines)
brief = conn.send_command("show ip interface brief", use_textfsm=True)
conn.disconnect()

state = {row["interface"]: (row["ip_address"], row["status"], row["proto"]) for row in brief}
bad = 0
for i in facts(nb, NAME)["interfaces"]:
    ip, status, proto = state.get(i["name"], ("missing", "-", "-"))
    ok = ip == i["address"] and status == "up" and proto == "up"
    bad += 0 if ok else 1
    print("  %-4s %-18s %-15s %s/%s" % ("OK" if ok else "FAIL", i["name"], ip, status, proto))
if bad:
    sys.exit("%s: %d interface(s) differ from NetBox" % (NAME, bad))

nb.dcim.devices.update([{"id": dev.id, "custom_fields": {"monitored": True},
                         "comments": "configuration pushed from NetBox data by push.py"}])
print("NetBox updated:", NAME, "monitored=True")</pre>

<h3>Data ke khilaf verify</h3>
<p>Push ke baad script <code>show ip interface brief</code> ko <code>use_textfsm=True</code> ke saath chalati hai, jo text ki jagah dictionaries ki list deta hai, aur har addressed interface ko NetBox ke bataye se milati hai. Interface tabhi OK hai jab address match kare <i>aur</i> status aur protocol dono up hon. Exit codes pipeline ke liye hain: mismatch par script kuch wapas likhne se pehle non-zero code ke saath khatam hoti hai.</p>
<pre class="out">AUTO01$ python3 push.py
PUN-CORE-R1: 19 lines rendered from NetBox, pushing to 10.99.0.1
  OK   GigabitEthernet0/0 10.99.0.1       up/up
  OK   GigabitEthernet0/1 172.31.10.1     up/up
  OK   Loopback0          1.1.1.1         up/up
NetBox updated: PUN-CORE-R1 monitored=True</pre>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     172.31.10.1     YES manual up                    up
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up</pre>
<p>Doosra box router khud hai, jahan se "OK" lines aati hain. Safalta kabhi script ke apne output se report mat karo ki usne kya bheja; hamesha device ko wapas padho.</p>

<h3>Write back</h3>
<p><code>push.py</code> ki aakhri do lines NetBox ko update karti hain: custom field <code>monitored</code> true ho jata hai aur ek comment likhta hai ki kya hua. NetBox ab "kaun se devices data se configure hue?" ka jawab deta hai, aur change log batata hai kab. Shape phir dekho: <code>update([{"id": dev.id, ...}])</code>, id wali list. Chapter 5 ne samjhaya ki labs aise kyun likhti hain.</p>

<h3>Drift: jab device aur NetBox asahmat hon</h3>
<p>Drift declared intent (NetBox) aur actual state (device) ke beech ka gap hai. Yeh tab aata hai jab koi teen baje raat console par kuch theek kar de aur NetBox update karna bhool jaye. <code>drift.py</code> sirf addresses check karti hai, jo vichar sikhane ke liye kaafi hai, aur exit code ko signal banati hai.</p>
<pre class="out">AUTO01$ python3 drift.py; echo "exit code: $?"
PUN-CORE-R1: 3 addressed interfaces in NetBox
drift: 0
exit code: 0</pre>
<p>Ab koi R1 par haath se Loopback0 badalta hai (Lab 1, task 6). Wahi script:</p>
<pre class="out">AUTO01$ python3 drift.py; echo "exit code: $?"
PUN-CORE-R1: 3 addressed interfaces in NetBox
<span class="hl">DRIFT Loopback0: NetBox 1.1.1.1, device 1.1.1.9</span>
drift: 1
exit code: 1</pre>
<p>Woh interface ka naam batati hai, dono values dikhati hai, drift gintati hai aur 1 se nikalti hai, taaki scheduler ya CI job alert kar sake. Kaun sa side sahi hai? Yeh logon ka faisla hai. Is module mein NetBox jeetta hai: data intent hai, aur device dobara push karke theek hota hai.</p>
<pre class="out">AUTO01$ python3 push.py
PUN-CORE-R1: 19 lines rendered from NetBox, pushing to 10.99.0.1
  OK   GigabitEthernet0/0 10.99.0.1       up/up
  OK   GigabitEthernet0/1 172.31.10.1     up/up
  OK   Loopback0          1.1.1.1         up/up</pre>
<pre class="out">AUTO01$ python3 drift.py; echo "exit code: $?"
PUN-CORE-R1: 3 addressed interfaces in NetBox
drift: 0
exit code: 0</pre>
<pre class="out">R1# show running-config | section ospf
router ospf 1
 network 10.99.0.0 0.0.0.255 area 0
 network 172.31.10.0 0.0.0.3 area 0
 network 1.1.1.1 0.0.0.0 area 0</pre>
<p>Re-push ne Loopback0 ko wapas 1.1.1.1 kar diya aur drift check phir saaf hai. Wahi configuration do baar push karna safe hai kyunki lines declarative hain: <code>ip address</code> purane ko replace karta hai, aur jo OSPF <code>network</code> statement pehle se hai woh kuch nahi badalta. Yahi gun "schedule par push" ko samajhdar yojana banata hai.</p>

<h3>Aage kahan jaana hai</h3>
<p>Do routers ke liye har device ki ek script theek hai aur do sau ke liye takleef. Agla module, adv-nornir, NetBox ko <code>nornir_netbox</code> ke saath inventory ki tarah jodta hai, taaki ek run filter se chuna har device parallel mein kar de. Yahan jo seekha, NetBox se facts, render, push, verify, wahi rehta hai; sirf loop framework mein chala jata hai. Yeh sirf aage ka ishara hai; is chapter ko Nornir ki zaroorat nahi.</p>

<div class="warn"><p><b>Common mistake.</b> Render padhe bina push karna. Har naye template ke liye kam se kam ek baar lines print karo (ya <code>show running-config</code> se diff karo). Check mein dus second lagte hain aur isne kai outages bachaye hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>send_config_set</code> lines push karta hai par save nahi karta. <code>write memory</code> (ya <code>save_config()</code>) ke bina reload par change kho jata hai. Soch samajhkar tay karo ki aapka workflow save karta hai ya nahi.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> R1 lab IOS XE hai; <code>show ip interface brief</code>, <code>send_config_set</code> aur TextFSM parsing dikhaye anusaar chalte hain. Asli routers banner aur prompt ki details mein alag hote hain, kuch commands par confirmation maang sakte hain, aur badi configuration lagane mein zyada waqt lete hain, isliye realistic timeouts rakho. Asli devices mein SSH user ke paas privilege 15 ya enable secret bhi chahiye; lab privilege 15 use karta hai.</p></div>

<div class="scn"><h4>Loopback jiske baare mein NetBox ko kisi ne nahi bataya</h4><p>Raat ke maintenance mein ek engineer ne route-reflector design test karne ke liye core router ka loopback badla, phir bhool gaya. Ek hafte baad routing team ne NetBox se prefix list banayi aur naya address filter ho gaya. Drift job, jo ise pakadti, band kar di gayi thi kyunki woh "baar baar fail hoti thi". Failures hi to maksad the.</p><p><b>Lesson:</b> jo alarm tang karta hai woh kaam kar raha hai. Wajah theek karo ya tay karo ki kaun sa side sahi hai; use mute mat karo.</p></div>
<div class="iv"><p class="q">"Configuration drift kya hai aur NetBox se use kaise detect karte ho?"</p><p>Drift tab hai jab device ki running state source of truth ke intent se match nahi karti. Main NetBox se intended addresses padhta hoon, device se TextFSM ke saath actual addresses padhta hoon, farq list karta hoon aur koi ho to non-zero se nikalta hoon. Repair NetBox se re-push hai, ya agar manual change sahi tha to NetBox ka update.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Render, push, device par verify, write back, phir drift check.</li>
<li>Data se connect karo: host ke liye <code>primary_ip4</code>, secrets environment se.</li>
<li>TextFSM se facts compare karo, text nahi, aur mismatch par non-zero se nikalo.</li>
<li>Declarative configuration ka re-push safe hai aur drift theek karta hai.</li>
<li>adv-nornir (agla) kai devices ek saath ke liye NetBox ko inventory ki tarah use karta hai.</li></ul></div>`}};export{e as default};