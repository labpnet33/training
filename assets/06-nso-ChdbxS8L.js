var e={id:`nso`,h:{en:`NSO: service models, YANG, RESTCONF and safe changes`,hi:`NSO: service models, YANG, RESTCONF aur safe changes`},body:{en:`
<p>The platforms so far manage one product family. Real networks mix vendors: a Cisco router here, a Juniper firewall there, an Arista switch in the lab. <b>Cisco Network Services Orchestrator (NSO)</b> is built for that. It lets you describe a <b>service</b> ("customer A needs a VPN between site 1 and site 2") once, in a vendor-neutral model, and NSO works out the exact commands for every device involved, in the language of each vendor.</p>

<h3>The building blocks</h3>
<ul>
<li><b>YANG model.</b> You met YANG in the model-driven programmability material: a language that describes the shape of configuration and state data. In NSO every service, and every device, is described by a YANG model.</li>
<li><b>NED (Network Element Driver).</b> A plug-in that knows how to talk to one vendor's devices and translate between the NSO model and the device's own CLI or API. You add a NED per device type.</li>
<li><b>CDB (configuration database).</b> NSO's own database that holds the intended configuration, a copy of each device's configuration and the service instances.</li>
<li><b>Service model and mapping.</b> The service model is a YANG model whose fields are the few things an operator must fill in (customer name, two endpoints, bandwidth). The <b>mapping</b> (a service template or code in Python or Java) says how those fields turn into device configuration.</li>
<li><b>FASTMAP.</b> NSO's method for managing the life of a service. It records what a service created, so a change or a delete is calculated automatically; you never write a "delete" version of the logic.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NSO architecture">
<rect x="10" y="10" width="620" height="38" rx="8" fill="#fde68a"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Northbound: RESTCONF, NETCONF, CLI, web UI, Python API</text>
<rect x="10" y="62" width="620" height="76" rx="8" fill="#bae6fd"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">NSO: service models (YANG) + mapping (template or code) + CDB</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">FASTMAP computes what to add, change or remove</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">Transaction: validate, dry-run, commit or roll back</text>
<rect x="10" y="152" width="620" height="30" rx="8" fill="#ddd6fe"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">NEDs (one per vendor/OS)</text>
<rect x="10" y="190" width="190" height="32" rx="8" fill="#bbf7d0"/><text x="105" y="211" text-anchor="middle" class="svg-ink" font-size="12">Cisco IOS XE router</text>
<rect x="225" y="190" width="190" height="32" rx="8" fill="#bbf7d0"/><text x="320" y="211" text-anchor="middle" class="svg-ink" font-size="12">Juniper device</text>
<rect x="440" y="190" width="190" height="32" rx="8" fill="#bbf7d0"/><text x="535" y="211" text-anchor="middle" class="svg-ink" font-size="12">Other vendor</text>
</svg><p class="cap">One service request in, vendor-specific changes out. NSO sits in the middle as a transactional engine.</p></div>

<h3>How you talk to NSO</h3>
<p>NSO offers several northbound interfaces. For the exam and for scripts, the important ones are <b>RESTCONF</b> (HTTP with JSON or XML, the model-driven REST style you saw in module auto-requests) and <b>NETCONF</b> (XML over SSH). Both are driven by the same YANG models, so a field you see in the CLI is the same field in RESTCONF. The RESTCONF root is <code>/restconf</code> and the data tree is <code>/restconf/data</code>, with module-qualified names, just like in Lab 2 later. Authentication is normally HTTP basic authentication or a token.</p>
<p>Two example paths you can recognise: <code>/restconf/data/tailf-ncs:devices/device=core-r1</code> (one managed device) and <code>/restconf/data/tailf-ncs:services</code> (the service instances).</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - create a VPN service instance</span>
import requests
BASE = "h&#116;tps://nso.example:8888"
H = {"Content-Type": "application/yang-data+json", "Accept": "application/yang-data+json"}
body = {"l3vpn:l3vpn": [{"name": "custA", "endpoint": [
          {"id": "site1", "device": "core-r1", "interface": "0/1", "ip-address": "198.51.100.1"},
          {"id": "site2", "device": "core-r2", "interface": "0/1", "ip-address": "203.0.113.1"}]}]}
r = requests.post(BASE + "/restconf/data/tailf-ncs:services",
                  auth=("admin", "YOUR_PASSWORD"), headers=H, json=body)
print(r.status_code)                                   <span class="c"># 201 Created</span></pre>
<p>The service name <code>l3vpn</code> here is an example package; your NSO has whatever services your team wrote. The point is the shape: a small, vendor-neutral JSON body, and NSO produces the full per-device configuration.</p>

<h3>Safe changes: dry-run, commit, rollback</h3>
<p>This is why network teams adopt NSO. A change is a <b>transaction</b>: either every device gets its part or none does.</p>
<ol>
<li><b>Dry-run.</b> Ask NSO to show what it <i>would</i> send to each device, without sending it. In the NSO CLI you add <code>dry-run</code> to the commit; in RESTCONF there is a dry-run query parameter on the request. You read the result, device by device, in native CLI form.</li>
<li><b>Commit.</b> NSO sends the changes, checks that all devices accepted them and stores the result. If one device refuses, the whole transaction is rolled back, so you never end up with half a VPN.</li>
<li><b>Rollback.</b> Each commit creates a numbered rollback file. If something is wrong later, you apply the rollback file and NSO reverses that change on all devices.</li>
</ol>
<pre class="out">admin@ncs(config)# commit dry-run outformat native
native {
    device {
        name core-r1
        data interface GigabitEthernet0/1
              ip address <span class="hl">198.51.100.1 255.255.255.252</span>
              no shutdown
    }
    device {
        name core-r2
        data interface GigabitEthernet0/1
              ip address 203.0.113.1 255.255.255.252
    }
}</pre>
<p>Other terms you may meet: <b>check-sync</b> (is the device still as NSO expects?), <b>sync-from</b> (read the device's configuration into NSO if someone changed it by hand) and the <b>commit queue</b> (send changes to devices asynchronously). Do not worry about the details for the exam; know what dry-run and rollback are for.</p>

<div class="warn"><p><b>Common mistakes.</b> Changing a device by hand on its CLI. NSO's copy is now out of sync and the next service change can fail or overwrite the manual change; use check-sync and sync-from. Skipping dry-run on a large change. Mixing up a service model (the intent) with a device model (the box).</p></div>
<div class="exam"><p><b>Exam trap.</b> NSO is a multi-vendor <b>orchestrator</b> driven by YANG models; its device drivers are NEDs; its API styles are RESTCONF and NETCONF. It is not the same as Catalyst Center (one vendor, campus) or Ansible (no transactional rollback by default).</p></div>

<div class="scn"><h4>One VPN, three vendors, no half-built service</h4><p>A service provider needed to add a customer VPN across two Cisco routers and one other-vendor PE. The old process was three engineers, three CLIs and a change window that often ended with a forgotten line on one device. With an NSO service model, the engineer posted one JSON body over RESTCONF with the customer name and the three endpoints. The dry-run output showed the exact commands for each vendor. After review, the commit applied everywhere in one transaction. When the customer cancelled, deleting the service instance removed every line from all three devices.</p><p><b>Lesson:</b> model the service once, let NSO produce device syntax, and use dry-run and rollback for safety.</p></div>

<div class="iv"><p class="q">"What problem does NSO solve that a script with SSH does not?"</p><p>NSO gives a vendor-neutral service model, drivers for many vendors, a transactional engine (all devices commit or none), dry-run to preview exact device changes, rollback, and FASTMAP so updates and deletes are computed automatically. A plain SSH script has none of that; you write and maintain the delete logic and the error handling yourself.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSO orchestrates services across vendors using YANG models, NEDs and a CDB.</li>
<li>A service model holds the few operator inputs; the mapping turns them into device config.</li>
<li>FASTMAP tracks what a service created so changes and deletes are automatic.</li>
<li>Northbound APIs: RESTCONF (/restconf/data, module-qualified names) and NETCONF.</li>
<li>Safety: dry-run to preview, transactional commit, rollback files to undo.</li>
</ul></div>
`,hi:`
<p>Ab tak ke platforms ek product family manage karte hain. Asli networks mein vendors mile hote hain: yahan Cisco router, wahan Juniper firewall, lab mein Arista switch. <b>Cisco Network Services Orchestrator (NSO)</b> isi ke liye bana hai. Aap ek <b>service</b> ("customer A ko site 1 aur site 2 ke beech VPN chahiye") ko ek baar vendor-neutral model mein describe karte ho, aur NSO har shamil device ke liye, har vendor ki apni language mein, exact commands nikaal leta hai.</p>

<h3>Building blocks</h3>
<ul>
<li><b>YANG model.</b> YANG aap model-driven programmability material mein mil chuke ho: ek language jo configuration aur state data ki shakal describe karti hai. NSO mein har service aur har device ek YANG model se describe hota hai.</li>
<li><b>NED (Network Element Driver).</b> Ek plug-in jo ek vendor ke devices se baat karna aur NSO model aur device ke apne CLI ya API ke beech translate karna jaanta hai. Har device type ke liye ek NED jodte ho.</li>
<li><b>CDB (configuration database).</b> NSO ka apna database jismein intended configuration, har device ki configuration ki copy aur service instances rehte hain.</li>
<li><b>Service model aur mapping.</b> Service model ek YANG model hai jiske fields wahi kuch cheezein hain jo operator ko bharni hain (customer name, do endpoints, bandwidth). <b>Mapping</b> (service template ya Python ya Java code) batati hai ki yeh fields device configuration kaise ban-te hain.</li>
<li><b>FASTMAP.</b> Service ki life manage karne ka NSO ka tareeka. Yeh record karta hai ki service ne kya banaya, isliye change ya delete apne aap calculate hota hai; aapko "delete" wala logic kabhi alag se likhna nahi padta.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NSO architecture">
<rect x="10" y="10" width="620" height="38" rx="8" fill="#fde68a"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Northbound: RESTCONF, NETCONF, CLI, web UI, Python API</text>
<rect x="10" y="62" width="620" height="76" rx="8" fill="#bae6fd"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">NSO: service models (YANG) + mapping (template ya code) + CDB</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">FASTMAP calculate karta hai kya add, change ya remove karna hai</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">Transaction: validate, dry-run, commit ya roll back</text>
<rect x="10" y="152" width="620" height="30" rx="8" fill="#ddd6fe"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">NEDs (har vendor/OS ke liye ek)</text>
<rect x="10" y="190" width="190" height="32" rx="8" fill="#bbf7d0"/><text x="105" y="211" text-anchor="middle" class="svg-ink" font-size="12">Cisco IOS XE router</text>
<rect x="225" y="190" width="190" height="32" rx="8" fill="#bbf7d0"/><text x="320" y="211" text-anchor="middle" class="svg-ink" font-size="12">Juniper device</text>
<rect x="440" y="190" width="190" height="32" rx="8" fill="#bbf7d0"/><text x="535" y="211" text-anchor="middle" class="svg-ink" font-size="12">Doosra vendor</text>
</svg><p class="cap">Ek service request andar, vendor-specific changes bahar. NSO beech mein transactional engine ki tarah baitha hai.</p></div>

<h3>NSO se baat kaise karte hain</h3>
<p>NSO kai northbound interfaces deta hai. Exam aur scripts ke liye zaroori hain <b>RESTCONF</b> (JSON ya XML ke saath HTTP, wahi model-driven REST style jo aapne auto-requests module mein dekha) aur <b>NETCONF</b> (SSH par XML). Dono wahi YANG models se chalte hain, isliye CLI mein jo field dikhta hai wahi RESTCONF mein hai. RESTCONF root <code>/restconf</code> hai aur data tree <code>/restconf/data</code>, module-qualified naamon ke saath, bilkul aage Lab 2 ki tarah. Authentication aam taur par HTTP basic authentication ya token hai.</p>
<p>Do example paths jo pehchan sakte ho: <code>/restconf/data/tailf-ncs:devices/device=core-r1</code> (ek managed device) aur <code>/restconf/data/tailf-ncs:services</code> (service instances).</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - VPN service instance banana</span>
import requests
BASE = "h&#116;tps://nso.example:8888"
H = {"Content-Type": "application/yang-data+json", "Accept": "application/yang-data+json"}
body = {"l3vpn:l3vpn": [{"name": "custA", "endpoint": [
          {"id": "site1", "device": "core-r1", "interface": "0/1", "ip-address": "198.51.100.1"},
          {"id": "site2", "device": "core-r2", "interface": "0/1", "ip-address": "203.0.113.1"}]}]}
r = requests.post(BASE + "/restconf/data/tailf-ncs:services",
                  auth=("admin", "YOUR_PASSWORD"), headers=H, json=body)
print(r.status_code)                                   <span class="c"># 201 Created</span></pre>
<p>Yahan service ka naam <code>l3vpn</code> ek example package hai; aapke NSO mein woh services hongi jo aapki team ne likhi hain. Asli baat shakal hai: chhoti vendor-neutral JSON body, aur NSO poori per-device configuration banata hai.</p>

<h3>Safe changes: dry-run, commit, rollback</h3>
<p>Network teams NSO isi liye apnati hain. Change ek <b>transaction</b> hai: ya har device ko apna hissa milta hai ya kisi ko nahi.</p>
<ol>
<li><b>Dry-run.</b> NSO se kaho ki woh har device ko kya <i>bhejega</i> yeh dikha de, bheje bina. NSO CLI mein commit ke saath <code>dry-run</code> lagate ho; RESTCONF mein request par dry-run query parameter hota hai. Result device-by-device, native CLI form mein padhte ho.</li>
<li><b>Commit.</b> NSO changes bhejta hai, check karta hai ki saare devices ne accept kiye aur result store karta hai. Agar ek device mana kare to poori transaction roll back ho jaati hai, isliye aadha VPN kabhi nahi bachta.</li>
<li><b>Rollback.</b> Har commit ek numbered rollback file banata hai. Baad mein kuch galat nikle to rollback file apply karo aur NSO woh change saare devices par ulat deta hai.</li>
</ol>
<pre class="out">admin@ncs(config)# commit dry-run outformat native
native {
    device {
        name core-r1
        data interface GigabitEthernet0/1
              ip address <span class="hl">198.51.100.1 255.255.255.252</span>
              no shutdown
    }
    device {
        name core-r2
        data interface GigabitEthernet0/1
              ip address 203.0.113.1 255.255.255.252
    }
}</pre>
<p>Aur terms jo mil sakte hain: <b>check-sync</b> (device abhi bhi waisa hai jaisa NSO sochta hai?), <b>sync-from</b> (agar kisi ne haath se badla ho to device ki configuration NSO mein padh lo) aur <b>commit queue</b> (changes ko devices par asynchronously bhejo). Exam ke liye details ki chinta mat karo; dry-run aur rollback kis liye hain yeh jaano.</p>

<div class="warn"><p><b>Common mistakes.</b> Device ko uske CLI se haath se badalna. NSO ki copy ab out of sync hai aur agla service change fail ho sakta hai ya manual change ko overwrite kar sakta hai; check-sync aur sync-from use karo. Bade change par dry-run chhod dena. Service model (intent) aur device model (box) ko mila dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> NSO multi-vendor <b>orchestrator</b> hai jo YANG models se chalta hai; uske device drivers NEDs hain; uske API styles RESTCONF aur NETCONF hain. Yeh Catalyst Center (ek vendor, campus) ya Ansible (default mein transactional rollback nahi) jaisa nahi hai.</p></div>

<div class="scn"><h4>Ek VPN, teen vendors, koi aadhi-bani service nahi</h4><p>Ek service provider ko do Cisco routers aur ek doosre vendor ke PE par customer VPN jodna tha. Purani process thi teen engineers, teen CLIs aur ek change window jo aksar kisi ek device par bhooli hui line ke saath khatam hoti thi. NSO service model ke saath engineer ne RESTCONF par customer name aur teen endpoints wali ek JSON body post ki. Dry-run output ne har vendor ke exact commands dikhaye. Review ke baad commit ek transaction mein sab jagah apply hua. Jab customer ne cancel kiya, service instance delete karne se teeno devices se har line hat gayi.</p><p><b>Lesson:</b> service ko ek baar model karo, device syntax NSO se banwao, aur safety ke liye dry-run aur rollback use karo.</p></div>

<div class="iv"><p class="q">"NSO kaunsi problem solve karta hai jo SSH wali script nahi karti?"</p><p>NSO vendor-neutral service model, bahut vendors ke drivers, transactional engine (saare devices commit karein ya koi nahi), exact device changes ka preview dene wala dry-run, rollback, aur FASTMAP deta hai taaki updates aur deletes apne aap calculate hon. Plain SSH script mein yeh kuch nahi hota; delete logic aur error handling aapko khud likhni aur maintain karni padti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSO YANG models, NEDs aur CDB ke saath vendors ke across services orchestrate karta hai.</li>
<li>Service model mein operator ke kuch inputs hote hain; mapping unhe device config banati hai.</li>
<li>FASTMAP track karta hai ki service ne kya banaya, isliye changes aur deletes automatic hain.</li>
<li>Northbound APIs: RESTCONF (/restconf/data, module-qualified names) aur NETCONF.</li>
<li>Safety: preview ke liye dry-run, transactional commit, undo ke liye rollback files.</li>
</ul></div>
`}};export{e as default};