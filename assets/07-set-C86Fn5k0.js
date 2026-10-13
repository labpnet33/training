var e={id:`set`,h:{en:`Set: update, replace, delete and the read-back`,hi:`Set: update, replace, delete aur read-back`},body:{en:`
<p>Get looks, Set touches. A Set changes the device configuration, so the habit that matters most is to look before and look after. In Lab 1 you found the flapping port; now you label it so the next engineer knows, and you prove the change landed. This chapter covers tasks 6 and 7.</p>

<h3>Three operations in one request</h3>
<p>The call is <code>gc.set(delete=[...], replace=[(path, value)], update=[(path, value)])</code>. You may pass any mix. The device applies them in a fixed order (delete, then replace, then update) as <b>one transaction</b>: on a real device either all of it happens or none of it does.</p>
<table class="cmp"><tr><th>Operation</th><th>Effect</th><th>Careful when</th></tr>
<tr><td><code>update</code></td><td>Merge the value into what is there. Other leaves stay.</td><td>Safe default for a leaf.</td></tr>
<tr><td><code>replace</code></td><td>The path becomes exactly the value. Anything you did not mention at that path is removed.</td><td>The path is a container with children.</td></tr>
<tr><td><code>delete</code></td><td>Remove the path.</td><td>A later Get for that leaf gives NOT_FOUND.</td></tr></table>
<p>The reply is <code>{'response': [{'path': ..., 'op': ...}], 'timestamp': ...}</code>: one entry per operation, with the operation name in <code>op</code>. Check the reply, but do not stop there.</p>

<h3>Look, change, look again</h3>
<div class="dia"><svg viewBox="0 0 640 100" role="img" aria-label="Safe change loop: Get before, Set, Get after, check the CLI, save">
<rect x="10" y="26" width="104" height="48" rx="8" fill="#bae6fd"/><text x="62" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Get before</text>
<rect x="136" y="26" width="104" height="48" rx="8" fill="#fde68a"/><text x="188" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Set</text>
<rect x="262" y="26" width="104" height="48" rx="8" fill="#bbf7d0"/><text x="314" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Get after</text>
<rect x="388" y="26" width="116" height="48" rx="8" fill="#ddd6fe"/><text x="446" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Check the CLI</text>
<rect x="526" y="26" width="104" height="48" rx="8" fill="#fed7aa"/><text x="578" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Save</text>
<line x1="114" y1="50" x2="136" y2="50" stroke="#64748b" stroke-width="2"/><line x1="240" y1="50" x2="262" y2="50" stroke="#64748b" stroke-width="2"/><line x1="366" y1="50" x2="388" y2="50" stroke="#64748b" stroke-width="2"/><line x1="504" y1="50" x2="526" y2="50" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A Set without a read-back is a hope, not a change.</p></div>
<p>The experiment below uses the spare port Ethernet4. It updates two leaves, reads them back, triggers four typical refusals, and deletes the description.</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

IF = "/interfaces/interface[name=Ethernet4]"
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    print(gc.set(update=[(IF + "/config/description", "lab-spare"), (IF + "/config/mtu", 9000)]))
    res = gc.get(path=[IF + "/config"], datatype="config")
    print(res["notification"][0]["update"][0]["val"])
    for label, kw in (
        ("state leaf", dict(update=[(IF + "/state/description", "x")])),
        ("no such interface", dict(update=[("/interfaces/interface[name=Ethernet33]/config/description", "x")])),
        ("bad mtu", dict(update=[(IF + "/config/mtu", "abc")])),
        ("unsupported subtree", dict(update=[("/lldp/config/enabled", False)])),
    ):
        try:
            gc.set(**kw)
        except gNMIException as err:
            print(label, "-&gt;", err)
    print(gc.set(delete=[IF + "/config/description"]))
    try:
        gc.get(path=[IF + "/config/description"], datatype="config")
    except gNMIException as err:
        print("read back after delete -&gt;", err)</pre>
<pre class="out">AUTO01$ python3 d_set.py
{'response': [{'path': 'interfaces/interface[name=Ethernet4]/config/description', 'op': 'UPDATE'}, {'path': 'interfaces/interface[name=Ethernet4]/config/mtu', 'op': 'UPDATE'}], 'timestamp': 1791705281730000000}
{'name': 'Ethernet4', 'type': 'iana-if-type:ethernetCsmacd', 'mtu': 9000, 'enabled': False, 'description': 'lab-spare'}
<span class="hl">state leaf -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Path /interfaces/interface[name=Ethernet4]/state/description is read-only (state data cannot be modified with Set)</span>
<span class="hl">no such interface -&gt; gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Interface Ethernet33 does not exist on LEAF1</span>
<span class="hl">bad mtu -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Invalid value for mtu: "abc" (range 68..9216)</span>
<span class="hl">unsupported subtree -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Set is not supported for /lldp/config/enabled in this lab (supported: interface config description/enabled/mtu, interface IPv4 addresses, /system/config/hostname)</span>
{'response': [{'path': 'interfaces/interface[name=Ethernet4]/config/description', 'op': 'DELETE'}], 'timestamp': 1791705281880000000}
<span class="hl">read back after delete -&gt; gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Unable to find the path /interfaces/interface[name=Ethernet4]/config/description</span></pre>
<p>Read the four refusals, because you will meet them: a <code>state</code> leaf is read-only (INVALID_ARGUMENT), an interface that does not exist is NOT_FOUND, a bad value is INVALID_ARGUMENT with the allowed range, and a subtree the device cannot configure through gNMI is refused. After the delete, the leaf is gone and a Get says so. Next, <code>replace</code> on a leaf and a hostname change that is reverted:</p>
<pre class="code">from pygnmi.client import gNMIclient

IF = "/interfaces/interface[name=Ethernet4]"
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    print(gc.set(replace=[(IF + "/config/description", "replaced")])["response"])
    print(gc.get(path=[IF + "/config/description"], datatype="config")["notification"][0]["update"][0]["val"])
    print(gc.set(update=[("/system/config/hostname", "LEAF1-NEW")])["response"])
    print(gc.get(path=["/system/state/hostname"])["notification"][0]["update"][0]["val"])
    gc.set(update=[("/system/config/hostname", "LEAF1")])
    print(gc.get(path=["/system/state/hostname"])["notification"][0]["update"][0]["val"])</pre>
<pre class="out">AUTO01$ python3 d_rep.py
<span class="hl">[{'path': 'interfaces/interface[name=Ethernet4]/config/description', 'op': 'REPLACE'}]</span>
replaced
[{'path': 'system/config/hostname', 'op': 'UPDATE'}]
LEAF1-NEW
LEAF1</pre>

<h3>fix.py: label the flapping port (Lab 1, task 6)</h3>
<p>The script takes the port name from the command line, sets <code>config/description</code>, and reads the value back from the <code>config</code> datatype:</p>
<pre class="code">import sys
from pygnmi.client import gNMIclient

name = sys.argv[1]
path = f"/interfaces/interface[name={name}]/config/description"

with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    reply = gc.set(update=[(path, "FLAPPING-check-cable")])
    for r in reply["response"]:
        print(r["op"], r["path"])
    back = gc.get(path=[path], datatype="config")
    print("read back:", back["notification"][0]["update"][0]["val"])</pre>
<pre class="out">AUTO01$ python3 fix.py Ethernet3
UPDATE interfaces/interface[name=Ethernet3]/config/description
<span class="hl">read back: FLAPPING-check-cable</span></pre>

<h3>Prove it on the device (Lab 1, task 7)</h3>
<p>The last check does not trust Python at all. Look at the switch:</p>
<pre class="out">LEAF1# show running-config interfaces Ethernet3
interface Ethernet3
<span class="hl">   description FLAPPING-check-cable</span>
   no switchport
   ip address 10.1.3.1/30</pre>
<p>The description is there, in the running configuration, written by a gNMI Set. On EOS that is the running config only; saving it to the startup config is a separate step (<code>copy running-config startup-config</code>). On Junos the Set is committed for you.</p>

<div class="warn"><p><b>Common mistake.</b> Using <code>replace</code> on a container such as <code>/interfaces/interface[name=Ethernet3]/config</code> with only a description. Anything else at that path, such as <code>enabled</code> or the mtu, is reset. For one setting, use <code>update</code> on the leaf.</p></div>
<div class="exam"><p><b>Exam trap.</b> Set is transactional: if any operation in the request is invalid, none is applied. A Set needs write privilege; a read-only login can Get and Subscribe but gets PERMISSION_DENIED here.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab Set supports interface description, enabled, mtu, IPv4 addresses and the hostname; everything else is refused with "not supported in this lab". The lab runs the matching CLI lines, so a request that fails halfway is <b>not</b> rolled back, which a real device guarantees. The mtu is held in the gNMI layer of the lab.</p></div>

<div class="scn"><h4>The replace that removed an address</h4><p>An engineer pushed a description with <code>replace</code> on a whole interface container. The description was set, and so was a reset of the rest: the port lost its IP address and the uplink went silent. A Get before the change had been skipped, so the old values were not in the ticket.</p><p><b>Lesson:</b> keep the before and after Get in the change log, and use update for single leaves.</p></div>
<div class="iv"><p class="q">"What is the difference between update and replace in a gNMI Set?"</p><p>Update merges the given values into existing data. Replace makes the path equal to the given value, so omitted children are removed. Add that delete removes a path, and that the whole request is applied as one transaction.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Set takes delete, replace and update in one transactional request.</li>
<li>The reply lists each path with its op; always read back with Get.</li>
<li>Config is writable, state is not.</li>
<li>Confirm on the device, then save the configuration where needed.</li>
<li>Replace on a container is the dangerous one.</li></ul></div>
`,hi:`
<p>Get dekhta hai, Set chhoota hai. Set device ki configuration badalta hai, isliye sabse zaroori aadat hai pehle dekhna aur baad mein dekhna. Lab 1 mein aapne flapping port dhoondha; ab use label karte ho taaki agla engineer jaane, aur saabit karte ho ki change lag gaya. Yeh chapter tasks 6 aur 7 cover karta hai.</p>

<h3>Ek request mein teen operations</h3>
<p>Call hai <code>gc.set(delete=[...], replace=[(path, value)], update=[(path, value)])</code>. Aap koi bhi mix de sakte ho. Device unhe tay order mein (delete, phir replace, phir update) <b>ek transaction</b> ki tarah lagata hai: asli device par ya to sab hota hai ya kuch nahi.</p>
<table class="cmp"><tr><th>Operation</th><th>Asar</th><th>Kab savdhaan</th></tr>
<tr><td><code>update</code></td><td>Value ko maujooda data mein merge karta hai. Baaki leaves rehte hain.</td><td>Leaf ke liye safe default.</td></tr>
<tr><td><code>replace</code></td><td>Path bilkul wahi value ban jaata hai. Us path par jo aapne nahi likha woh hat jaata hai.</td><td>Path children wala container ho.</td></tr>
<tr><td><code>delete</code></td><td>Path hata deta hai.</td><td>Baad mein us leaf ka Get NOT_FOUND dega.</td></tr></table>
<p>Reply hai <code>{'response': [{'path': ..., 'op': ...}], 'timestamp': ...}</code>: har operation ki ek entry, <code>op</code> mein operation ka naam. Reply check karo, par wahin mat ruko.</p>

<h3>Dekho, badlo, phir dekho</h3>
<div class="dia"><svg viewBox="0 0 640 100" role="img" aria-label="Safe change loop: pehle Get, Set, baad ka Get, CLI check, save">
<rect x="10" y="26" width="104" height="48" rx="8" fill="#bae6fd"/><text x="62" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Pehle Get</text>
<rect x="136" y="26" width="104" height="48" rx="8" fill="#fde68a"/><text x="188" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Set</text>
<rect x="262" y="26" width="104" height="48" rx="8" fill="#bbf7d0"/><text x="314" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Baad ka Get</text>
<rect x="388" y="26" width="116" height="48" rx="8" fill="#ddd6fe"/><text x="446" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 CLI check</text>
<rect x="526" y="26" width="104" height="48" rx="8" fill="#fed7aa"/><text x="578" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Save</text>
<line x1="114" y1="50" x2="136" y2="50" stroke="#64748b" stroke-width="2"/><line x1="240" y1="50" x2="262" y2="50" stroke="#64748b" stroke-width="2"/><line x1="366" y1="50" x2="388" y2="50" stroke="#64748b" stroke-width="2"/><line x1="504" y1="50" x2="526" y2="50" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Read-back ke bina Set sirf umeed hai, change nahi.</p></div>
<p>Neeche ka experiment spare port Ethernet4 use karta hai. Woh do leaves update karta hai, unhe wapas padhta hai, chaar aam refusals trigger karta hai, aur description delete karta hai.</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

IF = "/interfaces/interface[name=Ethernet4]"
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    print(gc.set(update=[(IF + "/config/description", "lab-spare"), (IF + "/config/mtu", 9000)]))
    res = gc.get(path=[IF + "/config"], datatype="config")
    print(res["notification"][0]["update"][0]["val"])
    for label, kw in (
        ("state leaf", dict(update=[(IF + "/state/description", "x")])),
        ("no such interface", dict(update=[("/interfaces/interface[name=Ethernet33]/config/description", "x")])),
        ("bad mtu", dict(update=[(IF + "/config/mtu", "abc")])),
        ("unsupported subtree", dict(update=[("/lldp/config/enabled", False)])),
    ):
        try:
            gc.set(**kw)
        except gNMIException as err:
            print(label, "-&gt;", err)
    print(gc.set(delete=[IF + "/config/description"]))
    try:
        gc.get(path=[IF + "/config/description"], datatype="config")
    except gNMIException as err:
        print("read back after delete -&gt;", err)</pre>
<pre class="out">AUTO01$ python3 d_set.py
{'response': [{'path': 'interfaces/interface[name=Ethernet4]/config/description', 'op': 'UPDATE'}, {'path': 'interfaces/interface[name=Ethernet4]/config/mtu', 'op': 'UPDATE'}], 'timestamp': 1791705281730000000}
{'name': 'Ethernet4', 'type': 'iana-if-type:ethernetCsmacd', 'mtu': 9000, 'enabled': False, 'description': 'lab-spare'}
<span class="hl">state leaf -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Path /interfaces/interface[name=Ethernet4]/state/description is read-only (state data cannot be modified with Set)</span>
<span class="hl">no such interface -&gt; gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Interface Ethernet33 does not exist on LEAF1</span>
<span class="hl">bad mtu -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Invalid value for mtu: "abc" (range 68..9216)</span>
<span class="hl">unsupported subtree -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Set is not supported for /lldp/config/enabled in this lab (supported: interface config description/enabled/mtu, interface IPv4 addresses, /system/config/hostname)</span>
{'response': [{'path': 'interfaces/interface[name=Ethernet4]/config/description', 'op': 'DELETE'}], 'timestamp': 1791705281880000000}
<span class="hl">read back after delete -&gt; gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Unable to find the path /interfaces/interface[name=Ethernet4]/config/description</span></pre>
<p>Chaar refusals padho, kyunki yeh aapko milenge: <code>state</code> leaf read-only hai (INVALID_ARGUMENT), jo interface hai hi nahi woh NOT_FOUND hai, kharab value INVALID_ARGUMENT hai allowed range ke saath, aur jis subtree ko device gNMI se configure nahi kar sakta woh refuse hota hai. Delete ke baad leaf chala gaya aur Get yahi batata hai. Agla, leaf par <code>replace</code> aur hostname badlav jo wapas kiya gaya:</p>
<pre class="code">from pygnmi.client import gNMIclient

IF = "/interfaces/interface[name=Ethernet4]"
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    print(gc.set(replace=[(IF + "/config/description", "replaced")])["response"])
    print(gc.get(path=[IF + "/config/description"], datatype="config")["notification"][0]["update"][0]["val"])
    print(gc.set(update=[("/system/config/hostname", "LEAF1-NEW")])["response"])
    print(gc.get(path=["/system/state/hostname"])["notification"][0]["update"][0]["val"])
    gc.set(update=[("/system/config/hostname", "LEAF1")])
    print(gc.get(path=["/system/state/hostname"])["notification"][0]["update"][0]["val"])</pre>
<pre class="out">AUTO01$ python3 d_rep.py
<span class="hl">[{'path': 'interfaces/interface[name=Ethernet4]/config/description', 'op': 'REPLACE'}]</span>
replaced
[{'path': 'system/config/hostname', 'op': 'UPDATE'}]
LEAF1-NEW
LEAF1</pre>

<h3>fix.py: flapping port par label (Lab 1, task 6)</h3>
<p>Script port ka naam command line se leti hai, <code>config/description</code> set karti hai, aur value ko <code>config</code> datatype se wapas padhti hai:</p>
<pre class="code">import sys
from pygnmi.client import gNMIclient

name = sys.argv[1]
path = f"/interfaces/interface[name={name}]/config/description"

with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    reply = gc.set(update=[(path, "FLAPPING-check-cable")])
    for r in reply["response"]:
        print(r["op"], r["path"])
    back = gc.get(path=[path], datatype="config")
    print("read back:", back["notification"][0]["update"][0]["val"])</pre>
<pre class="out">AUTO01$ python3 fix.py Ethernet3
UPDATE interfaces/interface[name=Ethernet3]/config/description
<span class="hl">read back: FLAPPING-check-cable</span></pre>

<h3>Device par saabit karo (Lab 1, task 7)</h3>
<p>Aakhri check Python par bilkul bharosa nahi karta. Switch dekho:</p>
<pre class="out">LEAF1# show running-config interfaces Ethernet3
interface Ethernet3
<span class="hl">   description FLAPPING-check-cable</span>
   no switchport
   ip address 10.1.3.1/30</pre>
<p>Description wahan hai, running configuration mein, gNMI Set ne likhi. EOS par yeh sirf running config hai; startup config mein save karna alag step hai (<code>copy running-config startup-config</code>). Junos par Set aapke liye commit ho jaata hai.</p>

<div class="warn"><p><b>Aam galti.</b> <code>/interfaces/interface[name=Ethernet3]/config</code> jaise container par sirf description ke saath <code>replace</code> karna. Us path par jo bhi aur tha, jaise <code>enabled</code> ya mtu, reset ho jaata hai. Ek setting ke liye leaf par <code>update</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Set transactional hai: request ka koi bhi operation invalid ho to koi lagu nahi hota. Set ko write privilege chahiye; read-only login Get aur Subscribe kar sakta hai par yahan PERMISSION_DENIED milta hai.</p></div>
<div class="note"><p><b>Lab vs asli gear.</b> Lab Set interface description, enabled, mtu, IPv4 addresses aur hostname support karta hai; baaki sab "not supported in this lab" ke saath refuse hota hai. Lab matching CLI lines chalata hai, isliye jo request beech mein fail ho woh rollback <b>nahi</b> hoti, jabki asli device guarantee deta hai. Lab mein mtu gNMI layer mein rakha jaata hai.</p></div>

<div class="scn"><h4>Jis replace ne address hata diya</h4><p>Ek engineer ne poore interface container par <code>replace</code> se description push kiya. Description set hui, aur baaki sab reset bhi: port ka IP address chala gaya aur uplink chup ho gaya. Change se pehle Get chhoot gaya tha, isliye purani values ticket mein nahi thi.</p><p><b>Lesson:</b> pehle aur baad ke Get change log mein rakho, aur single leaves ke liye update use karo.</p></div>
<div class="iv"><p class="q">"gNMI Set mein update aur replace mein kya fark hai?"</p><p>Update diye hue values ko maujooda data mein merge karta hai. Replace path ko diye hue value ke barabar bana deta hai, isliye chhoote hue children hat jaate hain. Jodo ki delete path hata deta hai, aur poori request ek transaction ki tarah lagti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Set ek transactional request mein delete, replace aur update leta hai.</li>
<li>Reply har path ko uske op ke saath batata hai; hamesha Get se read-back karo.</li>
<li>Config likh sakte ho, state nahi.</li>
<li>Device par confirm karo, phir jahan zaroori ho configuration save karo.</li>
<li>Container par replace sabse khatarnak hai.</li></ul></div>
`}};export{e as default};