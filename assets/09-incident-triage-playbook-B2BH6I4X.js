var e={id:`incident-triage-playbook`,h:{en:`Incident triage playbook: tunnel, BGP, pool, policy`,hi:`Incident triage playbook: tunnel, BGP, pool, policy`},body:{en:`
<p>An emergency room nurse does not ask "what is wrong with this patient?" in the abstract. She runs triage: airway, breathing, circulation, in that order, and she stops at the first thing that is broken. A Prisma Access incident deserves the same discipline. Users shout "the internet is down", "the app does not open", "the branch is dead". Your playbook turns that noise into an ordered list of layers, and you stop at the first layer that fails.</p>

<h3>The order of layers</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Triage layers">
<rect x="20" y="10" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">0  Scope: who, where, since when, what changed</text>
<rect x="20" y="56" width="600" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">1  Delivery: is the configuration In sync, did the last push succeed?</text>
<rect x="20" y="102" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">2  Tunnel: IKE and IPsec up? (site tunnels)</text>
<rect x="20" y="148" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">3  Routing: BGP Established? Routes learned and advertised?</text>
<rect x="20" y="194" width="600" height="38" rx="8" fill="#fed7aa"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">4  Users: auth and pool; 5  Policy: zones, rule, profile</text>
</svg><p class="cap">Work top to bottom. Do not debug policy while the tunnel is down.</p></div>

<h3>Layer by layer</h3>
<table class="cmp">
<tr><th>Layer</th><th>Question</th><th>Where to look</th></tr>
<tr><td>Scope</td><td>One user, one site, or everyone?</td><td>Ticket, Activity Insights (Users, Branch Sites)</td></tr>
<tr><td>Delivery</td><td>Is it In sync? Did the last job fail?</td><td>Status or Sync Status; Jobs history</td></tr>
<tr><td>Tunnel</td><td>Is the IPsec tunnel up?</td><td>Monitor, Remote Networks; BR-FW or HQ-FW <code>show vpn ike-sa</code>, <code>show vpn ipsec-sa</code></td></tr>
<tr><td>BGP</td><td>Established? Prefixes?</td><td>Monitor BGP Status; Network Details BGP dialog (Peer, Local RIB, RIB Out)</td></tr>
<tr><td>Pool and auth</td><td>Can users connect and get an address?</td><td>Insights, Network Services; Status, Current Users; pool size</td></tr>
<tr><td>Policy</td><td>Which rule decided?</td><td>Log Viewer, Traffic log; zone mapping</td></tr>
</table>

<h3>The three faults of the lab incident</h3>
<p>The incident lab injects one fault from this set into a tenant that otherwise works. The three reachability tests that must pass at the end are: <b>branch to internet</b> (PC-BR 10.20.0.100), <b>laptop to app</b> (LAPTOP-HOME to 10.10.0.50) and <b>branch to HQ</b> (PC-BR to 10.10.0.50).</p>

<h4>Fault A: tunnel pre-shared key or crypto mismatch</h4>
<p>Symptom: the branch has no connectivity at all. Evidence: Monitor shows Tunnel Status down. On BR-FW (198.51.100.10) <code>show vpn ike-sa</code> returns no security association. The IKE debug log shows negotiation failing (wording varies). Documented causes: peer IP or pre-shared key mismatch, IKE or IPsec crypto mismatch, branch not using the Service Endpoint Address (203.0.113.101 in the lab). Fix: align the key and crypto on BR-FW, use the documented lab values (IKEv2, AES-256-CBC, SHA256, DH14, IPsec AES-256-GCM), test, then clear the SA if you changed crypto.</p>
<pre class="out">BR-FW: show vpn ike-sa   (abridged, illustrative)
Total 0 IKE SAs found

Monitor, Remote Networks
BR-FW   Tunnel Status: <span class="hl">down</span>   BGP Status: Connect</pre>

<h4>Fault B: BGP peer AS or address wrong</h4>
<p>Symptom: the tunnel is up but branch routes are missing, or HQ and mobile prefixes do not reach the branch. Evidence: Tunnel Status up, BGP Status stuck at Connect or Error; Network Details shows a Peer AS or address different from the branch router. Fix: set the Peer AS (lab: 65001), Peer IP (10.254.1.2) and Local IP (10.254.1.1) to match, keep a branch static route to the Local IP, and watch BGP reach Established and the prefix appear in Local RIB. Remember the Warning state means no update for more than eight minutes.</p>

<h4>Fault C: mobile user pool exhausted</h4>
<p>Symptom: new GlobalProtect users cannot get a working session while existing users are fine; or the pool is too small from the start. Evidence: Insights, Network Services shows authentication or connection issues; Status shows Current Users at a ceiling; the configured pool is small. Remember the facts: the lab pool 10.200.0.0/23 is the minimum size, addresses are handed out in /24 blocks per gateway, pool selection goes location group, then theater, then Worldwide, and sizing advice is twice the number of devices. Fix: add a new pool block rather than changing the mask or region of an existing one, which disrupts connected users.</p>

<div class="eg"><p><b>Worked example.</b> 09:12: "the branch cannot reach anything". Layer 0: whole branch, started 09:05, last change a Panorama push at 09:04. Layer 1: Status shows the remote network In sync (the push succeeded). Layer 2: Tunnel Status up, so not a tunnel fault. Layer 3: BGP Status is Connect and Network Details shows Peer AS 65100 where the branch uses 65001. The push at 09:04 contained a typo. Fix the AS, Commit and Push the networks scope, wait for In sync, confirm BGP Established, then run all three reachability tests. Time to fix: eleven minutes. The evidence at each layer ruled out the layers above.</p></div>

<h3>Verify, record, close</h3>
<ol>
<li>Run all three reachability tests: branch to internet, laptop to app, branch to HQ.</li>
<li>Confirm Status OK and In sync, tunnel up, BGP Established.</li>
<li>Write the timeline: symptom, evidence per layer, fix, time, who approved.</li>
<li>Add a prevention item (for example a change review for BGP fields).</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Jumping to policy first; fixing a symptom and not retesting all three paths; changing two things at once; clearing SAs on all tunnels instead of the affected one; closing the ticket without evidence.</p></div>
<div class="exam"><p><b>Exam trap.</b> Troubleshooting questions test layer order. Tunnel up with BGP down is a routing problem, not an IPsec problem. Authentication failures point to Network Services insights, not the remote network. Policy denies show in traffic logs, not in the tunnel status.</p></div>

<div class="scn"><h4>Two faults, one afternoon</h4><p>After a branch recovered from a pre-shared key typo, users at the branch could browse but could not reach HQ. The first fix had hidden a second fault: the HQ service connection had lost its return route to the branch subnet. Only the third reachability test (branch to HQ) caught it, because the first (branch to internet) now passed.</p><p><b>Lesson:</b> always run all three tests; one green test does not clear the others.</p></div>

<div class="iv"><p class="q">"Walk me through your approach to a Prisma Access outage."</p><p>Scope first, then delivery (In sync, jobs), then tunnel, BGP, user auth and pool, and finally policy through traffic logs. Stop at the first failed layer, change one thing, retest branch to internet, laptop to app and branch to HQ, and write down the timeline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triage layers in order: scope, delivery, tunnel, BGP, users and pool, policy.</li>
<li>Tunnel up with BGP down means a routing fault, not IPsec.</li>
<li>Pool changes must add blocks; do not change mask or region of an existing pool.</li>
<li>Always run the three reachability tests before closing.</li>
<li>Record evidence at every layer.</li>
</ul></div>
`,hi:`
<p>Emergency room ki nurse abstract mein nahi poochhti "is patient ko kya hua hai?". Wo triage chalati hai: airway, breathing, circulation, isi order mein, aur pehli toote hue cheez par ruk jati hai. Prisma Access incident ko bhi yahi discipline chahiye. Users chillate hain "internet down hai", "app nahi khulta", "branch dead hai". Aapka playbook us shor ko layers ki ordered list mein badal deta hai, aur aap pehli failed layer par ruk jaate ho.</p>

<h3>Layers ka order</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Triage layers">
<rect x="20" y="10" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">0  Scope: kaun, kahan, kab se, kya badla</text>
<rect x="20" y="56" width="600" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">1  Delivery: configuration In sync hai, last push succeed hua?</text>
<rect x="20" y="102" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">2  Tunnel: IKE aur IPsec up? (site tunnels)</text>
<rect x="20" y="148" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">3  Routing: BGP Established? Routes learned aur advertised?</text>
<rect x="20" y="194" width="600" height="38" rx="8" fill="#fed7aa"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">4  Users: auth aur pool; 5  Policy: zones, rule, profile</text>
</svg><p class="cap">Upar se neeche kaam karo. Tunnel down ho to policy debug mat karo.</p></div>

<h3>Layer by layer</h3>
<table class="cmp">
<tr><th>Layer</th><th>Sawal</th><th>Kahan dekhein</th></tr>
<tr><td>Scope</td><td>Ek user, ek site, ya sab?</td><td>Ticket, Activity Insights (Users, Branch Sites)</td></tr>
<tr><td>Delivery</td><td>In sync hai? Last job fail hua?</td><td>Status ya Sync Status; Jobs history</td></tr>
<tr><td>Tunnel</td><td>IPsec tunnel up hai?</td><td>Monitor, Remote Networks; BR-FW ya HQ-FW <code>show vpn ike-sa</code>, <code>show vpn ipsec-sa</code></td></tr>
<tr><td>BGP</td><td>Established? Prefixes?</td><td>Monitor BGP Status; Network Details BGP dialog (Peer, Local RIB, RIB Out)</td></tr>
<tr><td>Pool aur auth</td><td>Users connect ho kar address le sakte hain?</td><td>Insights, Network Services; Status, Current Users; pool size</td></tr>
<tr><td>Policy</td><td>Kaunse rule ne decide kiya?</td><td>Log Viewer, Traffic log; zone mapping</td></tr>
</table>

<h3>Lab incident ke teen faults</h3>
<p>Incident lab ek tenant mein, jo warna theek chalta hai, is set se ek fault inject karta hai. Aakhir mein teen reachability tests pass hone chahiye: <b>branch to internet</b> (PC-BR 10.20.0.100), <b>laptop to app</b> (LAPTOP-HOME se 10.10.0.50) aur <b>branch to HQ</b> (PC-BR se 10.10.0.50).</p>

<h4>Fault A: tunnel pre-shared key ya crypto mismatch</h4>
<p>Symptom: branch ke paas koi connectivity nahi. Evidence: Monitor Tunnel Status down dikhata hai. BR-FW (198.51.100.10) par <code>show vpn ike-sa</code> koi security association nahi deta. IKE debug log negotiation fail dikhata hai (wording alag ho sakti hai). Documented causes: peer IP ya pre-shared key mismatch, IKE ya IPsec crypto mismatch, branch Service Endpoint Address (lab mein 203.0.113.101) use nahi kar raha. Fix: BR-FW par key aur crypto align karo, documented lab values use karo (IKEv2, AES-256-CBC, SHA256, DH14, IPsec AES-256-GCM), test karo, aur crypto badla ho to SA clear karo.</p>
<pre class="out">BR-FW: show vpn ike-sa   (abridged, illustrative)
Total 0 IKE SAs found

Monitor, Remote Networks
BR-FW   Tunnel Status: <span class="hl">down</span>   BGP Status: Connect</pre>

<h4>Fault B: BGP peer AS ya address galat</h4>
<p>Symptom: tunnel up hai lekin branch routes missing hain, ya HQ aur mobile prefixes branch tak nahi pahunchte. Evidence: Tunnel Status up, BGP Status Connect ya Error par atka; Network Details mein Peer AS ya address branch router se alag. Fix: Peer AS (lab: 65001), Peer IP (10.254.1.2) aur Local IP (10.254.1.1) match karo, Local IP ke liye branch static route rakho, aur BGP ko Established hote tatha prefix ko Local RIB mein aate dekho. Yaad rakho Warning state matlab aath minute se zyada update nahi.</p>

<h4>Fault C: mobile user pool exhausted</h4>
<p>Symptom: naye GlobalProtect users ka working session nahi ban pata jabki existing users theek hain; ya pool shuru se chhota hai. Evidence: Insights, Network Services authentication ya connection issues dikhata hai; Status Current Users ko ceiling par dikhata hai; configured pool chhota hai. Facts yaad rakho: lab pool 10.200.0.0/23 minimum size hai, addresses har gateway ke liye /24 blocks mein diye jaate hain, pool selection location group, phir theater, phir Worldwide ke order mein hota hai, aur sizing advice devices ka double hai. Fix: naya pool block add karo, existing pool ka mask ya region mat badlo kyunki isse connected users disrupt hote hain.</p>

<div class="eg"><p><b>Worked example.</b> 09:12: "branch kuch bhi reach nahi kar paa raha". Layer 0: poori branch, 09:05 se, last change 09:04 ka Panorama push. Layer 1: Status remote network ko In sync dikhata hai (push succeed hua). Layer 2: Tunnel Status up, yani tunnel fault nahi. Layer 3: BGP Status Connect hai aur Network Details Peer AS 65100 dikhata hai jabki branch 65001 use karta hai. 09:04 ke push mein typo tha. AS fix karo, networks scope Commit and Push karo, In sync ka wait karo, BGP Established confirm karo, phir teeno reachability tests chalao. Fix mein gyarah minute. Har layer ke evidence ne upar ki layers ko rule out kiya.</p></div>

<h3>Verify, record, close</h3>
<ol>
<li>Teeno reachability tests chalao: branch to internet, laptop to app, branch to HQ.</li>
<li>Confirm karo Status OK aur In sync, tunnel up, BGP Established.</li>
<li>Timeline likho: symptom, har layer ka evidence, fix, time, kisne approve kiya.</li>
<li>Prevention item jodo (jaise BGP fields ke liye change review).</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Pehle policy par kood jana; symptom fix karke teeno paths dobara test na karna; ek saath do cheezein badalna; affected tunnel ke bajay saare tunnels ke SAs clear karna; evidence ke bina ticket close karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Troubleshooting questions layer order test karte hain. Tunnel up ke saath BGP down routing problem hai, IPsec problem nahi. Authentication failures Network Services insights ki taraf ishara karte hain, remote network ki taraf nahi. Policy denies traffic logs mein dikhte hain, tunnel status mein nahi.</p></div>

<div class="scn"><h4>Do faults, ek dopahar</h4><p>Branch pre-shared key typo se recover hui to branch ke users browse kar paa rahe the lekin HQ tak nahi pahunch paa rahe the. Pehle fix ne doosra fault chhupa rakha tha: HQ service connection ka branch subnet ke liye return route kho gaya tha. Sirf teesra reachability test (branch to HQ) ne ise pakda, kyunki pehla (branch to internet) ab pass ho raha tha.</p><p><b>Lesson:</b> hamesha teeno tests chalao; ek green test baaki ko clear nahi karta.</p></div>

<div class="iv"><p class="q">"Prisma Access outage ke liye apna approach batao."</p><p>Pehle scope, phir delivery (In sync, jobs), phir tunnel, BGP, user auth aur pool, aur aakhir mein traffic logs se policy. Pehli failed layer par ruko, ek cheez badlo, branch to internet, laptop to app aur branch to HQ retest karo, aur timeline likho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triage layers order mein: scope, delivery, tunnel, BGP, users aur pool, policy.</li>
<li>Tunnel up ke saath BGP down matlab routing fault, IPsec nahi.</li>
<li>Pool changes mein blocks add karo; existing pool ka mask ya region mat badlo.</li>
<li>Close karne se pehle hamesha teen reachability tests chalao.</li>
<li>Har layer par evidence record karo.</li>
</ul></div>
`}};export{e as default};