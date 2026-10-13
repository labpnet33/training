var e={id:`one-tool`,h:{en:`One tool for two firewalls: read-back, drift repair and key rotation`,hi:`Do firewalls ke liye ek tool: read-back, drift repair aur key rotation`},body:{en:`
<p>You now have two clients, FortiGate and ASA, and idempotent change scripts for both. This chapter closes the loop. A change is finished when a script <b>reads both firewalls back and agrees with the ticket</b>, and when the keys used to do it can be replaced without panic. It is Lab 1, steps 6 and 7.</p>

<h3>An analogy: the snagging list</h3>
<p>A builder hands over a flat. A careful buyer walks round with a checklist: tap on the wall, run the tap, open every window. Every item is checked <em>against the contract</em>, not against the builder's word. <code>verify.py</code> is the snagging list for your firewalls, and it is a program, so anyone can run it at any time and it gives a yes or a no.</p>

<h3>The whole flow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="The change pipeline of CHG-3105"><rect x="8" y="50" width="100" height="60" rx="10" fill="#bae6fd"/><text x="58" y="77" text-anchor="middle" class="svg-ink" font-size="12">CHG-3105</text><text x="58" y="94" text-anchor="middle" class="svg-muted" font-size="11">intent</text><line x1="108" y1="80" x2="128" y2="80" stroke="#64748b" stroke-width="2"/><polygon points="128,80 120,76 120,84" fill="#64748b"/><rect x="128" y="50" width="118" height="60" rx="10" fill="#fed7aa"/><text x="187" y="77" text-anchor="middle" class="svg-ink" font-size="12">FGT1</text><text x="187" y="94" text-anchor="middle" class="svg-muted" font-size="11">ensure x4</text><line x1="246" y1="80" x2="266" y2="80" stroke="#64748b" stroke-width="2"/><polygon points="266,80 258,76 258,84" fill="#64748b"/><rect x="266" y="50" width="118" height="60" rx="10" fill="#bbf7d0"/><text x="325" y="77" text-anchor="middle" class="svg-ink" font-size="12">ASA1</text><text x="325" y="94" text-anchor="middle" class="svg-muted" font-size="11">ensure x2</text><line x1="384" y1="80" x2="404" y2="80" stroke="#64748b" stroke-width="2"/><polygon points="404,80 396,76 396,84" fill="#64748b"/><rect x="404" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="459" y="77" text-anchor="middle" class="svg-ink" font-size="12">verify.py</text><text x="459" y="94" text-anchor="middle" class="svg-muted" font-size="11">read back</text><line x1="514" y1="66" x2="540" y2="40" stroke="#64748b" stroke-width="2"/><polygon points="540,40 532,48 532,48" fill="#64748b"/><line x1="514" y1="94" x2="540" y2="120" stroke="#64748b" stroke-width="2"/><polygon points="540,120 532,112 532,112" fill="#64748b"/><rect x="540" y="20" width="92" height="40" rx="10" fill="#bbf7d0"/><text x="586" y="37" text-anchor="middle" class="svg-ink" font-size="12">exit 0</text><text x="586" y="54" text-anchor="middle" class="svg-muted" font-size="11">all match</text><rect x="540" y="100" width="92" height="40" rx="10" fill="#fecaca"/><text x="586" y="117" text-anchor="middle" class="svg-ink" font-size="12">exit 1</text><text x="586" y="134" text-anchor="middle" class="svg-muted" font-size="11">drift</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">Every step is safe to run twice.</text></svg><p class="cap">Intent in, changes applied, everything read back, one exit code out.</p></div>
<p>Plan (ticket data at the top of the scripts) &rarr; apply (ensure) &rarr; read back (verify) &rarr; repair if wrong &rarr; verify again. There is no commit and no rollback on these two devices, so the read-back is not a nicety, it is the only proof.</p>

<h3>verify.py</h3>
<p>The script asks both firewalls for the facts of CHG-3105 and prints one line per fact. It uses <code>find()</code> and <code>differs()</code> from chapter 5, so the comparison logic is shared. It exits with code 0 when everything matches and 1 when anything does not:</p>
<pre class="code">"""verify.py - read both firewalls back and compare them with CHG-3105. Exit code 0 only when all match."""
import sys

import asa
import fgt

WANT_FGT = [
    ("firewall/address", "web1", {"subnet": "10.20.0.10 255.255.255.255"}),
    ("firewall/address", "web2", {"subnet": "10.20.0.11 255.255.255.255"}),
    ("firewall/addrgrp", "WEB-SERVERS", {"member": ["web1", "web2"]}),
    ("firewall/policy", "lan-to-web", {"action": "accept", "dstaddr": ["WEB-SERVERS"], "service": ["HT&#84;PS"], "nat": "enable"}),
]

bad = 0
fs = fgt.session()
for path, name, want in WANT_FGT:
    have = fgt.find(fs, path, name)
    delta = want if have is None else fgt.differs(have, want)
    bad += bool(delta)
    print("FGT1  %-16s %-12s %s" % (path, name, "ok" if not delta else "WRONG " + str(sorted(delta))))

as_ = asa.session()
obj = asa.get_object(as_, "web2")
good = obj is not None and obj["host"]["value"] == "10.1.1.20"
bad += not good
print("ASA1  %-16s %-12s %s" % ("networkobject", "web2", "ok" if good else "WRONG"))
rule = asa.find_rule(as_, "outside", "web2", "tcp/443")
bad += rule is None
print("ASA1  %-16s %-12s %s" % ("access rule", "outside", "ok, position %s" % rule["position"] if rule else "MISSING"))
print("verify: %d problem(s)" % bad)
sys.exit(1 if bad else 0)</pre>
<p>Notice what it does not do: it never writes. A verification script that can change things is no longer an independent check.</p>

<h3>Drift: somebody changes the firewall by hand</h3>
<p>To see it work, play the colleague who "just quickly fixes" a subnet on the console of FGT1:</p>
<pre class="code">config firewall address
    edit web2
        set subnet 10.20.0.99 255.255.255.255
    next
end</pre>
<pre class="out">AUTO01$ python3 verify.py; echo "exit code: $?"
FGT1  firewall/address web1         ok
<span class="hl">FGT1  firewall/address web2         WRONG ['subnet']</span>
FGT1  firewall/addrgrp WEB-SERVERS  ok
FGT1  firewall/policy  lan-to-web   ok
ASA1  networkobject    web2         ok
ASA1  access rule      outside      ok, position 2
<span class="hl">verify: 1 problem(s)</span>
<span class="hl">exit code: 1</span></pre>
<p>Read the line <code>web2 WRONG ['subnet']</code>: the script does not only say something is wrong, it says <b>which field</b>. The final line gives a count, and the shell shows the exit code 1, which a scheduler, a CI job or a following shell command (<code>python3 verify.py &amp;&amp; echo done</code>) can act on. The same script that makes the change repairs the drift, because ensure() sends only the delta:</p>
<pre class="out">AUTO01$ python3 objects.py
address  web1         unchanged
<span class="hl">address  web2         updated</span>
addrgrp  WEB-SERVERS  unchanged</pre>
<pre class="out">AUTO01$ python3 verify.py; echo "exit code: $?"
FGT1  firewall/address web1         ok
FGT1  firewall/address web2         ok
FGT1  firewall/addrgrp WEB-SERVERS  ok
FGT1  firewall/policy  lan-to-web   ok
ASA1  networkobject    web2         ok
ASA1  access rule      outside      ok, position 2
<span class="hl">verify: 0 problem(s)</span>
<span class="hl">exit code: 0</span></pre>
<p>Only <code>web2</code> was updated; the rest stayed unchanged. Run <code>verify.py</code> from a schedule and you have drift detection for these objects, with nothing but Python and the two APIs.</p>

<h3>Rotating the API key</h3>
<p>Keys do not live forever. Replace them on a schedule, when an engineer leaves, and at once if one is ever seen in a place it should not be. On FortiOS rotation is one command, and it is <b>destructive</b>: the new key replaces the old one immediately.</p>
<pre class="out">FGT1 # execute api-user generate-key pyapi
<span class="hl">New API key: 8MZICJjouNLJ0jZUaYHalxE5dKwXP2</span>
NOTE: The bearer of this API key will be granted all access privileges assigned to the api-user pyapi.
AUTO01$ python3 status.py
<span class="hl">rejected: GET /monitor/system/status -&gt; status 401, FortiOS error -37</span></pre>
<p>The second command proves it. The old key that is still in your shell now gets <code>status 401, FortiOS error -37</code>. The steps for a safe rotation are: (1) announce the change window, because every user of that key breaks, (2) generate the new key on the firewall, (3) export it in the shell or put it in the secret store, never in the script, (4) run <code>status.py</code> and <code>verify.py</code>, (5) tell the key's other users. Because the script reads <code>FGT_TOKEN</code> from the environment, nothing in the code changes.</p>

<h3>The audit: is a key hiding in the code?</h3>
<p>One more check, worth running before every commit. Search the scripts for a 30-character run of letters and digits, the shape of a FortiOS key:</p>
<pre class="out">AUTO01$ grep -nE '[A-Za-z0-9]{30}' *.py; echo "matches: $?"
<span class="hl">matches: 1</span></pre>
<p><code>grep</code> exits 1 when nothing matches, so <code>matches: 1</code> means <b>clean</b>. If it printed a line, you have found a key in a file and must rotate it as if it were leaked. Passwords have no fixed shape, so also search for the word <code>password</code>.</p>

<div class="eg"><p><b>Worked example: the Monday drift report.</b> A cron job on the automation server runs <code>verify.py</code> every morning and mails the output only when the exit code is not 0. On a Monday it reports <code>FGT1 firewall/address web2 WRONG ['subnet']</code>. The change log shows nobody had a ticket for web2. The team reads the console history, finds an emergency change from Friday night, and either records it properly or lets the script repair the object. Without the script nobody would have known until the first complaint.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab keys are fixed strings; real FortiOS generates a random key each time. Real firewalls hold hundreds of objects and several VDOMs: verify only the objects of your ticket, and loop over VDOMs explicitly. The comparison covers the fields you list; a field you did not list can drift unseen. Choose the fields that matter for security (source, destination, service, action, NAT) and not the cosmetic ones.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing the "created" message instead of reading back. Letting the verify script repair things "to be helpful". Putting the new key in the script after a rotation. Rotating without telling the other users of the key. Forgetting that a rotation on a shared api-user logs out every integration that used it.</p></div>
<div class="exam"><p><b>Exam trap.</b> The contrast that is asked in interviews: NETCONF and PAN-OS have a <b>candidate</b> and a <b>commit</b> (NETCONF can even <b>confirm</b> a commit and roll back on its own after a timer); the FortiOS and ASA REST APIs write to the running configuration at once. There is no undo button, so the safety is: read before, apply idempotently, read after.</p></div>

<div class="scn"><h4>The key in the chat</h4><p>A new colleague pasted a script into the team chat to ask for help. It held a real API key in a variable at the top. Two hours later someone noticed. The correct response is not to delete the message and hope: it is (1) generate a new key at once, which kills the pasted one, (2) check the firewall logs for requests from addresses outside the trusted list, (3) fix the script to read the environment variable, (4) record the incident. The trusted hosts list limited the damage: the pasted key only worked from the automation server.</p><p><b>Lesson:</b> rotation is the fix, trusted hosts are the safety net, and the environment variable prevents the repeat.</p></div>

<div class="iv"><p class="q">"How do you prove a firewall change was applied correctly, when there is no commit or rollback?"</p><p>I read it back with a separate, read-only script that compares the live objects with the ticket and returns an exit code. If it finds a difference, it says which field, the change script repairs it (it sends only the delta), and I verify again. I also keep the check on a schedule for drift detection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A change is complete when a read-only script confirms it; return exit code 0 or 1.</li>
<li>Name the field that drifted; repair with the same idempotent ensure().</li>
<li>generate-key replaces the old key at once: plan it, tell users, update the environment, verify.</li>
<li>Audit code for key-shaped strings; grep exit 1 means clean.</li>
<li>Contrast: NETCONF and PAN-OS have candidate plus commit; FortiOS and ASA REST write live.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas do clients hain, FortiGate aur ASA, aur dono ke idempotent change scripts. Yeh chapter loop band karta hai. Change tab poora hota hai jab ek script <b>dono firewalls wapas padhe aur ticket se sahmat ho</b>, aur jab use karne wali keys bina ghabrahat ke badli ja sakein. Yeh Lab 1, steps 6 aur 7 hai.</p>

<h3>Ek analogy: snagging list</h3>
<p>Builder flat saunpta hai. Samajhdar kharidaar checklist lekar ghoomta hai: deewar thapthapao, nal chalao, har khidki kholo. Har cheez <em>contract ke saath</em> check hoti hai, builder ke bol ke saath nahi. <code>verify.py</code> aapke firewalls ki snagging list hai, aur woh program hai, isliye koi bhi, kabhi bhi chala sakta hai aur woh haan ya na deta hai.</p>

<h3>Poora flow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="CHG-3105 ki change pipeline"><rect x="8" y="50" width="100" height="60" rx="10" fill="#bae6fd"/><text x="58" y="77" text-anchor="middle" class="svg-ink" font-size="12">CHG-3105</text><text x="58" y="94" text-anchor="middle" class="svg-muted" font-size="11">intent</text><line x1="108" y1="80" x2="128" y2="80" stroke="#64748b" stroke-width="2"/><polygon points="128,80 120,76 120,84" fill="#64748b"/><rect x="128" y="50" width="118" height="60" rx="10" fill="#fed7aa"/><text x="187" y="77" text-anchor="middle" class="svg-ink" font-size="12">FGT1</text><text x="187" y="94" text-anchor="middle" class="svg-muted" font-size="11">ensure x4</text><line x1="246" y1="80" x2="266" y2="80" stroke="#64748b" stroke-width="2"/><polygon points="266,80 258,76 258,84" fill="#64748b"/><rect x="266" y="50" width="118" height="60" rx="10" fill="#bbf7d0"/><text x="325" y="77" text-anchor="middle" class="svg-ink" font-size="12">ASA1</text><text x="325" y="94" text-anchor="middle" class="svg-muted" font-size="11">ensure x2</text><line x1="384" y1="80" x2="404" y2="80" stroke="#64748b" stroke-width="2"/><polygon points="404,80 396,76 396,84" fill="#64748b"/><rect x="404" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="459" y="77" text-anchor="middle" class="svg-ink" font-size="12">verify.py</text><text x="459" y="94" text-anchor="middle" class="svg-muted" font-size="11">read back</text><line x1="514" y1="66" x2="540" y2="40" stroke="#64748b" stroke-width="2"/><polygon points="540,40 532,48 532,48" fill="#64748b"/><line x1="514" y1="94" x2="540" y2="120" stroke="#64748b" stroke-width="2"/><polygon points="540,120 532,112 532,112" fill="#64748b"/><rect x="540" y="20" width="92" height="40" rx="10" fill="#bbf7d0"/><text x="586" y="37" text-anchor="middle" class="svg-ink" font-size="12">exit 0</text><text x="586" y="54" text-anchor="middle" class="svg-muted" font-size="11">sab match</text><rect x="540" y="100" width="92" height="40" rx="10" fill="#fecaca"/><text x="586" y="117" text-anchor="middle" class="svg-ink" font-size="12">exit 1</text><text x="586" y="134" text-anchor="middle" class="svg-muted" font-size="11">drift</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">Har step do baar chalana safe hai.</text></svg><p class="cap">Intent andar, changes apply, sab wapas padha, bahar ek exit code.</p></div>
<p>Plan (scripts ke upar ticket data) &rarr; apply (ensure) &rarr; read back (verify) &rarr; galat ho to repair &rarr; phir verify. In do devices par commit aur rollback nahi hai, isliye read-back sajaavat nahi, akela saboot hai.</p>

<h3>verify.py</h3>
<p>Script dono firewalls se CHG-3105 ke facts maangti hai aur har fact ki ek line print karti hai. Woh chapter 5 ka <code>find()</code> aur <code>differs()</code> use karti hai, isliye comparison logic shared hai. Sab match kare to exit code 0, kuch na kare to 1:</p>
<pre class="code">"""verify.py - read both firewalls back and compare them with CHG-3105. Exit code 0 only when all match."""
import sys

import asa
import fgt

WANT_FGT = [
    ("firewall/address", "web1", {"subnet": "10.20.0.10 255.255.255.255"}),
    ("firewall/address", "web2", {"subnet": "10.20.0.11 255.255.255.255"}),
    ("firewall/addrgrp", "WEB-SERVERS", {"member": ["web1", "web2"]}),
    ("firewall/policy", "lan-to-web", {"action": "accept", "dstaddr": ["WEB-SERVERS"], "service": ["HT&#84;PS"], "nat": "enable"}),
]

bad = 0
fs = fgt.session()
for path, name, want in WANT_FGT:
    have = fgt.find(fs, path, name)
    delta = want if have is None else fgt.differs(have, want)
    bad += bool(delta)
    print("FGT1  %-16s %-12s %s" % (path, name, "ok" if not delta else "WRONG " + str(sorted(delta))))

as_ = asa.session()
obj = asa.get_object(as_, "web2")
good = obj is not None and obj["host"]["value"] == "10.1.1.20"
bad += not good
print("ASA1  %-16s %-12s %s" % ("networkobject", "web2", "ok" if good else "WRONG"))
rule = asa.find_rule(as_, "outside", "web2", "tcp/443")
bad += rule is None
print("ASA1  %-16s %-12s %s" % ("access rule", "outside", "ok, position %s" % rule["position"] if rule else "MISSING"))
print("verify: %d problem(s)" % bad)
sys.exit(1 if bad else 0)</pre>
<p>Dhyan do woh kya nahi karti: kabhi likhti nahi. Jo verification script cheezein badal sakti hai woh ab independent check nahi rahi.</p>

<h3>Drift: koi haath se firewall badal deta hai</h3>
<p>Kaam karte dekhne ke liye us colleague ka role karo jo FGT1 ke console par "bas jaldi se" subnet theek kar deta hai:</p>
<pre class="code">config firewall address
    edit web2
        set subnet 10.20.0.99 255.255.255.255
    next
end</pre>
<pre class="out">AUTO01$ python3 verify.py; echo "exit code: $?"
FGT1  firewall/address web1         ok
<span class="hl">FGT1  firewall/address web2         WRONG ['subnet']</span>
FGT1  firewall/addrgrp WEB-SERVERS  ok
FGT1  firewall/policy  lan-to-web   ok
ASA1  networkobject    web2         ok
ASA1  access rule      outside      ok, position 2
<span class="hl">verify: 1 problem(s)</span>
<span class="hl">exit code: 1</span></pre>
<p>Line <code>web2 WRONG ['subnet']</code> padho: script sirf yeh nahi kehti ki kuch galat hai, woh batati hai <b>kaunsi field</b>. Aakhri line count deti hai, aur shell exit code 1 dikhata hai, jis par scheduler, CI job ya agli shell command (<code>python3 verify.py &amp;&amp; echo done</code>) kaam kar sakte hain. Jo script change karti hai wahi drift repair karti hai, kyunki ensure() sirf delta bhejta hai:</p>
<pre class="out">AUTO01$ python3 objects.py
address  web1         unchanged
<span class="hl">address  web2         updated</span>
addrgrp  WEB-SERVERS  unchanged</pre>
<pre class="out">AUTO01$ python3 verify.py; echo "exit code: $?"
FGT1  firewall/address web1         ok
FGT1  firewall/address web2         ok
FGT1  firewall/addrgrp WEB-SERVERS  ok
FGT1  firewall/policy  lan-to-web   ok
ASA1  networkobject    web2         ok
ASA1  access rule      outside      ok, position 2
<span class="hl">verify: 0 problem(s)</span>
<span class="hl">exit code: 0</span></pre>
<p>Sirf <code>web2</code> update hua; baaki unchanged rahe. <code>verify.py</code> ko schedule par chalao to in objects ke liye drift detection mil gaya, sirf Python aur do APIs se.</p>

<h3>API key rotate karna</h3>
<p>Keys hamesha nahi chalti. Schedule par badlo, engineer ke jaane par badlo, aur kabhi koi aisi jagah dikhe jahan nahi honi chahiye to turant badlo. FortiOS par rotation ek command hai, aur woh <b>destructive</b> hai: nayi key purani ko turant replace karti hai.</p>
<pre class="out">FGT1 # execute api-user generate-key pyapi
<span class="hl">New API key: 8MZICJjouNLJ0jZUaYHalxE5dKwXP2</span>
NOTE: The bearer of this API key will be granted all access privileges assigned to the api-user pyapi.
AUTO01$ python3 status.py
<span class="hl">rejected: GET /monitor/system/status -&gt; status 401, FortiOS error -37</span></pre>
<p>Doosri command saabit karti hai. Purani key jo abhi aapke shell mein hai ab <code>status 401, FortiOS error -37</code> paati hai. Safe rotation ke steps: (1) change window announce karo, kyunki us key ka har user toot jaata hai, (2) firewall par nayi key generate karo, (3) shell mein export karo ya secret store mein rakho, script mein kabhi nahi, (4) <code>status.py</code> aur <code>verify.py</code> chalao, (5) key ke doosre users ko batao. Script <code>FGT_TOKEN</code> environment se padhti hai, isliye code mein kuch nahi badalta.</p>

<h3>Audit: kya code mein key chhupi hai?</h3>
<p>Ek aur check, jo har commit se pehle chalane layak hai. Scripts mein 30 characters ka letters-aur-digits ka run dhoondho, FortiOS key ki shape:</p>
<pre class="out">AUTO01$ grep -nE '[A-Za-z0-9]{30}' *.py; echo "matches: $?"
<span class="hl">matches: 1</span></pre>
<p>Kuch match na ho to <code>grep</code> exit 1 deta hai, isliye <code>matches: 1</code> ka matlab <b>saaf</b>. Koi line print ho to aapko file mein key mili hai aur use leaked jaisa maan kar rotate karna hoga. Passwords ki fixed shape nahi hoti, isliye <code>password</code> shabd bhi dhoondho.</p>

<div class="eg"><p><b>Worked example: Somvar ki drift report.</b> Automation server par cron job roz subah <code>verify.py</code> chalata hai aur exit code 0 na ho tabhi output mail karta hai. Ek Somvar report aati hai <code>FGT1 firewall/address web2 WRONG ['subnet']</code>. Change log mein web2 ke liye kisi ke paas ticket nahi. Team console history padhti hai, Shukravar raat ka emergency change milta hai, aur ya to use theek se record karti hai ya script ko object repair karne deti hai. Script ke bina pehli shikayat tak kisi ko pata nahi chalta.</p></div>

<div class="note"><p><b>Lab vs asli gear.</b> Lab keys fixed strings hain; asli FortiOS har baar random key generate karta hai. Asli firewalls mein sainkdon objects aur kai VDOMs hote hain: sirf apne ticket ke objects verify karo, aur VDOMs par explicitly loop karo. Comparison un fields ke liye hai jo aap list karte ho; jo field list nahi ki woh chupke se drift kar sakti hai. Security ke liye maayne rakhne wali fields chuno (source, destination, service, action, NAT), sajaavati nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Read-back ki jagah "created" message par bharosa. Verify script ko "madad ke liye" cheezein repair karne dena. Rotation ke baad nayi key script mein daal dena. Key ke doosre users ko bataye bina rotate karna. Yeh bhoolna ki shared api-user par rotation us key se judi har integration ko log out kar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interviews mein jo contrast poochha jaata hai: NETCONF aur PAN-OS mein <b>candidate</b> aur <b>commit</b> hota hai (NETCONF to commit <b>confirm</b> bhi karwa sakta hai aur timer ke baad khud rollback kar sakta hai); FortiOS aur ASA REST APIs running configuration mein turant likhti hain. Undo button nahi hai, isliye safety yeh hai: pehle padho, idempotent apply karo, baad mein padho.</p></div>

<div class="scn"><h4>Chat mein key</h4><p>Ek naye colleague ne madad maangne ke liye team chat mein script paste ki. Uske upar ek variable mein asli API key thi. Do ghante baad kisi ne dekha. Sahi response message delete karke ummeed karna nahi hai: (1) turant nayi key generate karo, jo pasted wali ko maar deti hai, (2) trusted list ke bahar ke addresses se aayi requests ke liye firewall logs dekho, (3) script ko environment variable padhne ke liye theek karo, (4) incident record karo. Trusted hosts list ne nuksan seemit kiya: pasted key sirf automation server se chalti thi.</p><p><b>Lesson:</b> rotation fix hai, trusted hosts safety net hain, aur environment variable dobara hone se rokta hai.</p></div>

<div class="iv"><p class="q">"Commit ya rollback na ho to saabit kaise karte ho ki firewall change sahi laga?"</p><p>Alag, read-only script se wapas padhta hoon jo live objects ko ticket se compare karti hai aur exit code deti hai. Farq mile to woh batati hai kaunsi field, change script use repair karti hai (sirf delta bhejti hai), aur main phir verify karta hoon. Drift detection ke liye yeh check schedule par bhi rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change tab poora jab read-only script confirm kare; exit code 0 ya 1 lautao.</li>
<li>Jo field drift hui uska naam batao; wahi idempotent ensure() se repair karo.</li>
<li>generate-key purani key turant replace karta hai: plan karo, users ko batao, environment update karo, verify karo.</li>
<li>Code mein key-shaped strings ka audit karo; grep exit 1 ka matlab saaf.</li>
<li>Contrast: NETCONF aur PAN-OS mein candidate plus commit; FortiOS aur ASA REST live likhte hain.</li>
</ul></div>
`}};export{e as default};