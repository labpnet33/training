var e={id:`big-picture`,h:{en:`Why script a PAN-OS firewall: the big picture`,hi:`PAN-OS firewall ko script kyon karein: big picture`},body:{en:`
<p><b>What you will learn.</b> This module takes you from "I click through the firewall web interface" to "I change a Palo Alto firewall from Python, commit it safely and prove the change". By the end you can ask the firewall for an API key without ever printing it, call the <b>XML API</b> with <code>requests</code>, read and write the candidate and the running configuration, start a commit and poll the job until it finishes, do the same work with <b>pan-os-python</b> objects and rules, build a change tool that commits only when something changed, and read every kind of "no" the firewall can say.</p>
<p><b>Prerequisites.</b> <code>adv-xml</code> (parsing XML replies, including the PAN-OS ones you met there), <code>auto-requests</code> (the <code>requests</code> library), <code>py-secrets</code> (environment variables and <code>.env</code> files) and <code>py-tools</code> (scripts you can run from cron or a pipeline). <code>adv-netconf</code> helps because candidate, commit and rollback are the same ideas, but you do not need it. FortiGate and Cisco ASA REST is a separate module, <code>adv-fw-rest</code>.</p>

<h3>An analogy: the draft slip and the stamp</h3>
<p>Imagine a bank counter. You do not change the ledger by writing in it. You fill in a <b>draft slip</b>, and nothing happens until the manager <b>stamps</b> it. Stamping takes a while, so you get a <b>token number</b> and wait. If the slip has a mistake, the manager rejects it at the stamp, not when you wrote it. A PAN-OS firewall works the same way: edits go to the <b>candidate configuration</b>, a <b>commit</b> validates and copies them to the <b>running configuration</b>, and the commit runs as a numbered <b>job</b> you can watch.</p>

<div class="dia"><svg viewBox="0 0 640 165" role="img" aria-label="diagram">
<rect x="8" y="30" width="100" height="60" rx="10" fill="#bae6fd"/><text x="58" y="57" text-anchor="middle" class="svg-ink" font-size="13">Python script</text><text x="58" y="74" text-anchor="middle" class="svg-muted" font-size="11">AUTO01</text>
<rect x="132" y="30" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="192" y="57" text-anchor="middle" class="svg-ink" font-size="13">requests</text><text x="192" y="74" text-anchor="middle" class="svg-muted" font-size="11">or pan-os-python</text>
<rect x="276" y="30" width="110" height="60" rx="10" fill="#fde68a"/><text x="331" y="57" text-anchor="middle" class="svg-ink" font-size="13">H&#84;TPS 443</text><text x="331" y="74" text-anchor="middle" class="svg-muted" font-size="11">/api/ + key</text>
<rect x="410" y="8" width="222" height="50" rx="10" fill="#fed7aa"/><text x="521" y="30" text-anchor="middle" class="svg-ink" font-size="13">candidate config</text><text x="521" y="47" text-anchor="middle" class="svg-muted" font-size="11">your edits wait here</text>
<rect x="410" y="72" width="222" height="50" rx="10" fill="#bbf7d0"/><text x="521" y="94" text-anchor="middle" class="svg-ink" font-size="13">running config</text><text x="521" y="111" text-anchor="middle" class="svg-muted" font-size="11">what the firewall enforces</text>
<line x1="108" y1="60" x2="132" y2="60" stroke="#64748b" stroke-width="2"/>
<line x1="252" y1="60" x2="276" y2="60" stroke="#64748b" stroke-width="2"/>
<line x1="386" y1="50" x2="410" y2="33" stroke="#64748b" stroke-width="2"/>
<line x1="386" y1="70" x2="410" y2="97" stroke="#64748b" stroke-width="2"/>
<text x="521" y="66" text-anchor="middle" class="svg-accent" font-size="13">commit job</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Nothing you set is live until a commit job finishes with OK.</text>
</svg><p class="cap">A script reaches the firewall over H&#84;TPS. Edits go to the candidate; a commit job copies them to running.</p></div>

<h3>Two ways in</h3>
<table class="cmp"><tr><th></th><th>XML API</th><th>pan-os-python</th></tr>
<tr><td>What it is</td><td>One web endpoint, <code>/api/</code>, on the management port; every request carries a <code>type</code></td><td>A Python library that wraps the XML API in objects</td></tr>
<tr><td>You write</td><td>XPaths and XML snippets</td><td><code>AddressObject</code>, <code>SecurityRule</code>, <code>fw.commit()</code></td></tr>
<tr><td>Best for</td><td>Anything, including operational commands and odd corners</td><td>Objects and policy, with checks done for you</td></tr>
<tr><td>You must still know</td><td>Candidate, running, commit job</td><td>The same, because the library talks the same API</td></tr></table>
<p>This module teaches both on purpose. When a library call fails, the message comes from the XML API underneath, and you can only read it if you know that layer.</p>

<h3>Your first call</h3>
<p>The lab host AUTO01 reaches the firewall BLR-FW1 at <code>10.99.0.42</code>. <code>panconf.py</code> holds the address and reads the API key from the environment. You will build that key in the next chapter; for now assume it is there.</p>
<pre class="code">import xml.etree.ElementTree as ET

import requests

from panconf import BASE, api_key

reply = requests.post(BASE, data={"type": "op", "cmd": "&lt;show&gt;&lt;system&gt;&lt;info&gt;&lt;/info&gt;&lt;/system&gt;&lt;/show&gt;"},
                      headers={"X-PAN-KEY": api_key()}, verify=False, timeout=10)
root = ET.fromstring(reply.text)
print("H&#84;TP", reply.status_code, "| status =", root.get("status"))
info = root.find("./result/system")
for tag in ("hostname", "model", "sw-version"):
    print("%-11s %s" % (tag, info.findtext(tag)))</pre>
<p>Notice two things. The H&#84;TP status and the <code>status</code> attribute are different facts, and we print both. And the command to run is not a CLI line: it is XML, <code>&lt;show&gt;&lt;system&gt;&lt;info&gt;</code>, the same words as <code>show system info</code>.</p>
<pre class="out">AUTO01$ python3 first.py
<span class="hl">H&#84;TP 200 | status = success</span>
hostname    BLR-FW1
model       PA-VM
sw-version  11.1.4</pre>

<div class="eg"><p><b>Worked example: the ticket.</b> CHG-3107 asks for three web servers in the dmz, a group called web-pool and a rule that lets the trust zone reach them with web-browsing. In Lab 1 you do it three times on purpose: once with raw XML API calls, once with pan-os-python, and once as a YAML-driven tool that you can run twice without harm. In Lab 2 a colleague's version of the change fails five different ways.</p></div>

<h3>The road map</h3>
<ul>
<li>Chapters 2 to 5: the XML API (key, request anatomy, config XPaths, commit jobs). Lab 1 tasks 1 to 3.</li>
<li>Chapters 6 to 8: pan-os-python (objects, rules, the change tool). Lab 1 tasks 4 to 7.</li>
<li>Chapter 9: every "no" the firewall says. Chapter 10: Lab 2, "The change the firewall refused". Chapter 11: summary.</li>
</ul>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab firewall is a simulator that answers like PAN-OS 11.1 for the calls in this module. It has one virtual system and no Panorama. Where a message or a timing differs from real hardware you will see a note like this one.</p></div>
<div class="warn"><p><b>Common mistake.</b> Treating the API as a faster way to type CLI lines. The firewall keeps a candidate and a running configuration; a script that sets objects and forgets the commit changes nothing, and a script that commits blindly can push someone else's half-finished edits too.</p></div>
<div class="exam"><p><b>Exam trap.</b> The XML API listens on the management interface over H&#84;TPS (TCP 443), and the management profile of that interface must allow h&#116;tps. If it does not, the call times out; it does not return a polite error.</p></div>

<div class="scn"><h4>The commit nobody ran</h4><p>A team scripted address-object changes for a branch firewall. The script printed "success" for every call, and an hour later the application still could not reach its new server. The calls had succeeded: the objects were in the candidate configuration. Nobody had committed, so the running configuration, the one that enforces traffic, never changed. Worse, the next admin to click Commit in the web interface published the half-finished edits together with their own.</p><p><b>Lesson:</b> an API success means "accepted into the candidate". Only a finished commit job means "live".</p></div>

<div class="iv"><p class="q">"What is the difference between the candidate and the running configuration on a Palo Alto firewall?"</p><p>Running is what the firewall enforces right now. Candidate is a working copy that every edit changes, from the web interface, the CLI or the API. A commit validates the candidate and, if it passes, makes it the new running configuration; it runs as a job, so I poll it for OK or FAIL. In a script I read the candidate with <code>action=get</code> and the running configuration with <code>action=show</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAN-OS has a candidate and a running configuration; a commit job joins them.</li>
<li>The XML API is one endpoint, <code>/api/</code>, driven by <code>type</code>, <code>action</code>, <code>xpath</code>, <code>element</code> and <code>cmd</code>.</li>
<li>pan-os-python wraps the same API in objects; the errors you see come from the XML API underneath.</li>
<li>H&#84;TP 200 does not mean success; read the <code>status</code> attribute and the <code>code</code>.</li>
<li>The management profile must allow h&#116;tps on the interface you call.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Yeh module aapko "main firewall ka web interface click karke chalata hoon" se "main Palo Alto firewall ko Python se badalta hoon, safely commit karta hoon aur change saabit karta hoon" tak le jaata hai. Ant mein aap firewall se API key maang sakoge bina use kabhi print kiye, <code>requests</code> se <b>XML API</b> call kar sakoge, candidate aur running configuration padh aur likh sakoge, commit shuru karke job ke khatam hone tak poll kar sakoge, wahi kaam <b>pan-os-python</b> objects aur rules se kar sakoge, aisa change tool bana sakoge jo tabhi commit kare jab kuch badla ho, aur firewall jitne tarah ke "no" kehta hai sabko padh sakoge.</p>
<p><b>Prerequisites.</b> <code>adv-xml</code> (XML replies parse karna, jisme PAN-OS ke replies bhi aaye the), <code>auto-requests</code> (<code>requests</code> library), <code>py-secrets</code> (environment variables aur <code>.env</code> files) aur <code>py-tools</code> (aisi scripts jo cron ya pipeline se chal sakein). <code>adv-netconf</code> madad karta hai kyunki candidate, commit aur rollback wahi ideas hain, par zaroori nahi. FortiGate aur Cisco ASA REST alag module hai, <code>adv-fw-rest</code>.</p>

<h3>Ek analogy: draft slip aur stamp</h3>
<p>Bank ka counter socho. Aap ledger mein seedha nahi likhte. Aap ek <b>draft slip</b> bharte ho, aur jab tak manager use <b>stamp</b> na kare kuch nahi hota. Stamp lagne mein waqt lagta hai, isliye aapko ek <b>token number</b> milta hai aur aap intezaar karte ho. Slip mein galti ho to manager use stamp ke waqt reject karta hai, likhte waqt nahi. PAN-OS firewall bilkul aise hi chalta hai: edits <b>candidate configuration</b> mein jaate hain, <b>commit</b> unhe validate karke <b>running configuration</b> mein copy karta hai, aur commit ek numbered <b>job</b> ki tarah chalta hai jise aap dekh sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 165" role="img" aria-label="diagram">
<rect x="8" y="30" width="100" height="60" rx="10" fill="#bae6fd"/><text x="58" y="57" text-anchor="middle" class="svg-ink" font-size="13">Python script</text><text x="58" y="74" text-anchor="middle" class="svg-muted" font-size="11">AUTO01</text>
<rect x="132" y="30" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="192" y="57" text-anchor="middle" class="svg-ink" font-size="13">requests</text><text x="192" y="74" text-anchor="middle" class="svg-muted" font-size="11">or pan-os-python</text>
<rect x="276" y="30" width="110" height="60" rx="10" fill="#fde68a"/><text x="331" y="57" text-anchor="middle" class="svg-ink" font-size="13">H&#84;TPS 443</text><text x="331" y="74" text-anchor="middle" class="svg-muted" font-size="11">/api/ + key</text>
<rect x="410" y="8" width="222" height="50" rx="10" fill="#fed7aa"/><text x="521" y="30" text-anchor="middle" class="svg-ink" font-size="13">candidate config</text><text x="521" y="47" text-anchor="middle" class="svg-muted" font-size="11">tumhare edits yahan rukte hain</text>
<rect x="410" y="72" width="222" height="50" rx="10" fill="#bbf7d0"/><text x="521" y="94" text-anchor="middle" class="svg-ink" font-size="13">running config</text><text x="521" y="111" text-anchor="middle" class="svg-muted" font-size="11">jo firewall lagu karta hai</text>
<line x1="108" y1="60" x2="132" y2="60" stroke="#64748b" stroke-width="2"/>
<line x1="252" y1="60" x2="276" y2="60" stroke="#64748b" stroke-width="2"/>
<line x1="386" y1="50" x2="410" y2="33" stroke="#64748b" stroke-width="2"/>
<line x1="386" y1="70" x2="410" y2="97" stroke="#64748b" stroke-width="2"/>
<text x="521" y="66" text-anchor="middle" class="svg-accent" font-size="13">commit job</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Jab tak commit job OK par khatam na ho, set kiya hua kuch live nahi hota.</text>
</svg><p class="cap">Script firewall tak H&#84;TPS se pahunchti hai. Edits candidate mein jaate hain; commit job unhe running mein copy karta hai.</p></div>

<h3>Andar aane ke do raaste</h3>
<table class="cmp"><tr><th></th><th>XML API</th><th>pan-os-python</th></tr>
<tr><td>Yeh kya hai</td><td>Management port par ek web endpoint, <code>/api/</code>; har request mein ek <code>type</code> hota hai</td><td>Python library jo XML API ko objects mein lapetti hai</td></tr>
<tr><td>Aap likhte ho</td><td>XPaths aur XML snippets</td><td><code>AddressObject</code>, <code>SecurityRule</code>, <code>fw.commit()</code></td></tr>
<tr><td>Kiske liye best</td><td>Sab kuch, operational commands aur ajeeb kono samet</td><td>Objects aur policy, checks library khud karti hai</td></tr>
<tr><td>Phir bhi jaanna zaroori</td><td>Candidate, running, commit job</td><td>Wahi, kyunki library wahi API bolti hai</td></tr></table>
<p>Yeh module dono jaan-boojhkar sikhata hai. Library call fail ho to message neeche wali XML API se aata hai, aur use tabhi padh paoge jab woh layer jaante ho.</p>

<h3>Aapki pehli call</h3>
<p>Lab host AUTO01 firewall BLR-FW1 tak <code>10.99.0.42</code> par pahunchta hai. <code>panconf.py</code> mein address hai aur woh API key environment se padhti hai. Woh key aap agle chapter mein banaoge; abhi maan lo ki woh maujood hai.</p>
<pre class="code">import xml.etree.ElementTree as ET

import requests

from panconf import BASE, api_key

reply = requests.post(BASE, data={"type": "op", "cmd": "&lt;show&gt;&lt;system&gt;&lt;info&gt;&lt;/info&gt;&lt;/system&gt;&lt;/show&gt;"},
                      headers={"X-PAN-KEY": api_key()}, verify=False, timeout=10)
root = ET.fromstring(reply.text)
print("H&#84;TP", reply.status_code, "| status =", root.get("status"))
info = root.find("./result/system")
for tag in ("hostname", "model", "sw-version"):
    print("%-11s %s" % (tag, info.findtext(tag)))</pre>
<p>Do cheezein dekho. H&#84;TP status aur <code>status</code> attribute alag baatein hain, aur hum dono print karte hain. Aur chalane wali command CLI line nahi hai: woh XML hai, <code>&lt;show&gt;&lt;system&gt;&lt;info&gt;</code>, wahi shabd jo <code>show system info</code> mein hote hain.</p>
<pre class="out">AUTO01$ python3 first.py
<span class="hl">H&#84;TP 200 | status = success</span>
hostname    BLR-FW1
model       PA-VM
sw-version  11.1.4</pre>

<div class="eg"><p><b>Worked example: ticket.</b> CHG-3107 dmz mein teen web servers, web-pool naam ka group aur ek rule maangta hai jo trust zone ko web-browsing se unhe tak pahunchne de. Lab 1 mein aap ise jaan-boojhkar teen baar karte ho: ek baar raw XML API calls se, ek baar pan-os-python se, aur ek baar YAML se chalne wale tool se jise do baar chalane mein koi nuksaan nahi. Lab 2 mein ek colleague ka version paanch alag tareeqon se fail hota hai.</p></div>

<h3>Road map</h3>
<ul>
<li>Chapters 2 se 5: XML API (key, request ki banawat, config XPaths, commit jobs). Lab 1 ke tasks 1 se 3.</li>
<li>Chapters 6 se 8: pan-os-python (objects, rules, change tool). Lab 1 ke tasks 4 se 7.</li>
<li>Chapter 9: firewall jitne "no" kehta hai sab. Chapter 10: Lab 2, "The change the firewall refused". Chapter 11: summary.</li>
</ul>

<div class="note"><p><b>In the lab vs on real gear.</b> Lab firewall ek simulator hai jo is module ki calls ke liye PAN-OS 11.1 jaisa jawab deta hai. Isme ek virtual system hai aur Panorama nahi. Jahan message ya timing asli hardware se alag hogi wahan aapko aisa hi note milega.</p></div>
<div class="warn"><p><b>Aam galti.</b> API ko CLI lines type karne ka tez tareeqa samajhna. Firewall candidate aur running configuration rakhta hai; jo script objects set karke commit bhool jaaye woh kuch nahi badalti, aur jo script andhadhund commit kare woh kisi aur ke adhoore edits bhi saath publish kar deti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> XML API management interface par H&#84;TPS (TCP 443) par sunti hai, aur us interface ke management profile mein h&#116;tps allowed hona chahiye. Nahi hai to call time out hoti hai; sabhya error nahi milta.</p></div>

<div class="scn"><h4>Woh commit jo kisi ne nahi chalaya</h4><p>Ek team ne branch firewall ke address-object changes script kiye. Script har call par "success" print karti rahi, aur ek ghante baad bhi application naye server tak nahi pahunch pa rahi thi. Calls sach mein safal thi: objects candidate configuration mein the. Kisi ne commit nahi kiya tha, isliye running configuration, jo traffic enforce karti hai, kabhi badli hi nahi. Aur bura yeh hua ki agle admin ne web interface mein Commit dabaya to apne edits ke saath adhoore edits bhi publish ho gaye.</p><p><b>Lesson:</b> API success ka matlab "candidate mein accept hua". Sirf poori hui commit job ka matlab "live".</p></div>

<div class="iv"><p class="q">"Palo Alto firewall par candidate aur running configuration mein kya farak hai?"</p><p>Running woh hai jo firewall abhi enforce kar raha hai. Candidate ek working copy hai jise har edit badalta hai, chahe web interface se, CLI se ya API se. Commit candidate ko validate karta hai aur pass ho jaye to use naya running configuration bana deta hai; woh job ki tarah chalta hai, isliye main OK ya FAIL ke liye use poll karta hoon. Script mein candidate ko <code>action=get</code> se aur running configuration ko <code>action=show</code> se padhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAN-OS mein candidate aur running configuration hote hain; commit job unhe jodta hai.</li>
<li>XML API ek endpoint hai, <code>/api/</code>, jo <code>type</code>, <code>action</code>, <code>xpath</code>, <code>element</code> aur <code>cmd</code> se chalta hai.</li>
<li>pan-os-python wahi API objects mein lapetti hai; jo errors dikhte hain woh neeche ki XML API se aate hain.</li>
<li>H&#84;TP 200 ka matlab success nahi; <code>status</code> attribute aur <code>code</code> padho.</li>
<li>Jis interface ko call kar rahe ho uske management profile mein h&#116;tps allowed hona chahiye.</li>
</ul></div>
`}};export{e as default};