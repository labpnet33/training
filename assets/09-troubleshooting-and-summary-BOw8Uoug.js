var e={id:`nat-troubleshooting`,h:{en:`NAT troubleshooting, summary and exam checklist`,hi:`NAT troubleshooting, summary aur exam checklist`},body:{en:`<p><b>Analogy.</b> When a parcel does not arrive you check each handover: was it posted, did the sorting office relabel it, did the courier find the address? NAT problems are solved the same way, one handover at a time, in the order the SRX uses.</p>
<h3>A checklist in packet order</h3>
<ol><li><b>Does the packet reach the SRX?</b> For a published address in the link subnet, did the neighbour ARP and did the SRX answer (proxy-ARP configured)?</li><li><b>Is the right NAT rule matched?</b> <code>show security nat destination rule all</code>, <code>show security nat static rule all</code>, <code>show security nat source rule all</code>: the <b>Translation hits</b> counters tell you which rule fired.</li><li><b>Is the zone direction right?</b> NAT rule-sets are from and to zones (static and destination: from only).</li><li><b>Is the policy written on the right address?</b> Translated destination, original source.</li><li><b>Did a session form?</b> <code>show security flow session</code>: In and Out lines show both translations.</li><li><b>Does the return path work?</b> Return traffic needs a route to the translated address; pools need proxy-ARP or an ISP route.</li></ol>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Rule hits stay at 0</td><td>Wrong from/to zone, match address or order of rule-sets</td></tr>
<tr><td>Hits move but no reply</td><td>No route back, ISP has no route to the translated address, or proxy-ARP missing</td></tr>
<tr><td>Hits move, policy hits 0</td><td>Policy written on the wrong (public or translated) address</td></tr>
<tr><td>Works for some users only</td><td>Pool without PAT is exhausted</td></tr>
<tr><td>Inbound works, outbound uses the wrong address</td><td>Static NAT missing, or the general source rule is matching instead</td></tr></table>
<pre class="out">user@SRX&gt; show security nat source pool all
Pool name          : POOL1
Port translation   : no
Total addresses    : 2
Translation hits   : <span class="hl">5</span>

user@SRX&gt; show security nat source rule all
  Translation hits         : 5
      Successful sessions    : 3
      Failed sessions        : <span class="hl">2</span></pre>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Checklist handovers"><rect x="6" y="35" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="53" y="64" text-anchor="middle" class="svg-ink" font-size="11">ARP / arrival</text><rect x="111" y="35" width="95" height="50" rx="8" fill="#fde68a"/><text x="158" y="64" text-anchor="middle" class="svg-ink" font-size="11">NAT rule hit</text><rect x="216" y="35" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="263" y="64" text-anchor="middle" class="svg-ink" font-size="11">policy hit</text><rect x="321" y="35" width="95" height="50" rx="8" fill="#bae6fd"/><text x="368" y="64" text-anchor="middle" class="svg-ink" font-size="11">session</text><rect x="426" y="35" width="95" height="50" rx="8" fill="#fde68a"/><text x="473" y="64" text-anchor="middle" class="svg-ink" font-size="11">return route</text><rect x="531" y="35" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="578" y="64" text-anchor="middle" class="svg-ink" font-size="11">server</text></svg><p class="cap">Find the first handover that fails.</p></div>
<div class="eg"><p><b>Worked example.</b> Published service unreachable. NAT destination rule hits: 0. ISP-side test shows no ARP reply for the public address. Proxy-ARP is missing. After adding it, rule hits move, a session appears and the policy shows hits.</p></div>
<div class="warn"><p><b>Common mistake.</b> Changing NAT and policy at the same time. You cannot tell which change fixed it. Change one thing, clear sessions, test, read the counters.</p></div>
<div class="exam"><p><b>Exam trap.</b> Old sessions keep their old translation. After a NAT change, clear the sessions before judging the result.</p></div>
<div class="scn"><h4>NAT works one way</h4><p>Inbound access to a server worked; its outbound connections used the shared PAT address and were rejected by a partner. The server needed a static NAT rule so that reverse static NAT applied before the general source rule.</p><p><b>Lesson:</b> bidirectional identity needs static NAT.</p></div>
<div class="iv"><p class="q">"A NAT'ed service stopped working. Where do you start?"</p><p>I follow the packet: ARP and arrival, which NAT rule has hits, the zones, the policy on translated addresses, the session In and Out lines, then the return path and pool statistics. I clear sessions before retesting.</p></div>
<h3>Summary and exam checklist</h3>
<ul><li>Order: static, destination, route, policy, reverse static, source.</li><li>Interface NAT = PAT on the egress address; pools use PAT by default; <code>port no-translation</code> is one-to-one and can run out; overflow-pool rescues.</li><li>Destination NAT needs a pool and rule set; proxy-ARP when the public address is in the interface subnet.</li><li>Static NAT is bidirectional, prefix lengths equal, priority over the others.</li><li>Policy sees the translated destination and the original source.</li></ul>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show security nat source rule all</code></td><td>Source rules and hits</td></tr>
<tr><td><code>show security nat source pool all</code></td><td>Pools, PAT yes/no, hits</td></tr>
<tr><td><code>show security nat destination rule all</code></td><td>Destination rules and hits</td></tr>
<tr><td><code>show security nat static rule all</code></td><td>Static rules and hits</td></tr>
<tr><td><code>show security flow session</code></td><td>In and Out lines with translations</td></tr></table>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Check handovers in packet order.</li><li>Rule hits, policy hits and sessions tell where it stops.</li><li>Clear sessions after NAT changes.</li></ul></div>`,hi:`<p><b>Analogy.</b> Jab parcel nahi pahunchta to aap har handover check karte ho: post hua tha, sorting office ne relabel kiya, courier ko address mila? NAT problems isi tarah solve hoti hain, ek handover ek baar, us order mein jo SRX use karta hai.</p>
<h3>Packet order mein checklist</h3>
<ol><li><b>Kya packet SRX tak pahunchta hai?</b> Link subnet ke published address ke liye, kya neighbour ne ARP kiya aur SRX ne jawab diya (proxy-ARP configured)?</li><li><b>Kya sahi NAT rule match hua?</b> <code>show security nat destination rule all</code>, <code>show security nat static rule all</code>, <code>show security nat source rule all</code>: <b>Translation hits</b> counters batate hain kaunsa rule chala.</li><li><b>Kya zone direction sahi hai?</b> NAT rule-sets from aur to zones ke hote hain (static aur destination: sirf from).</li><li><b>Kya policy sahi address par likhi hai?</b> Translated destination, original source.</li><li><b>Kya session bana?</b> <code>show security flow session</code>: In aur Out lines dono translations dikhati hain.</li><li><b>Kya return path chalta hai?</b> Return traffic ko translated address ka route chahiye; pools ko proxy-ARP ya ISP route chahiye.</li></ol>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit karan</th></tr>
<tr><td>Rule hits 0 rehte hain</td><td>Galat from/to zone, match address ya rule-sets ka order</td></tr>
<tr><td>Hits chalte hain lekin reply nahi</td><td>Wapas ka route nahi, ISP ke paas translated address ka route nahi, ya proxy-ARP missing</td></tr>
<tr><td>Hits chalte hain, policy hits 0</td><td>Policy galat (public ya translated) address par likhi hai</td></tr>
<tr><td>Sirf kuch users ke liye chalta hai</td><td>PAT ke bina pool khatam ho gaya</td></tr>
<tr><td>Inbound chalta hai, outbound galat address use karta hai</td><td>Static NAT missing, ya general source rule match ho raha hai</td></tr></table>
<pre class="out">user@SRX&gt; show security nat source pool all
Pool name          : POOL1
Port translation   : no
Total addresses    : 2
Translation hits   : <span class="hl">5</span>

user@SRX&gt; show security nat source rule all
  Translation hits         : 5
      Successful sessions    : 3
      Failed sessions        : <span class="hl">2</span></pre>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Checklist handovers"><rect x="6" y="35" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="53" y="64" text-anchor="middle" class="svg-ink" font-size="11">ARP / arrival</text><rect x="111" y="35" width="95" height="50" rx="8" fill="#fde68a"/><text x="158" y="64" text-anchor="middle" class="svg-ink" font-size="11">NAT rule hit</text><rect x="216" y="35" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="263" y="64" text-anchor="middle" class="svg-ink" font-size="11">policy hit</text><rect x="321" y="35" width="95" height="50" rx="8" fill="#bae6fd"/><text x="368" y="64" text-anchor="middle" class="svg-ink" font-size="11">session</text><rect x="426" y="35" width="95" height="50" rx="8" fill="#fde68a"/><text x="473" y="64" text-anchor="middle" class="svg-ink" font-size="11">return route</text><rect x="531" y="35" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="578" y="64" text-anchor="middle" class="svg-ink" font-size="11">server</text></svg><p class="cap">Pehla handover dhoondo jo fail hota hai.</p></div>
<div class="eg"><p><b>Worked example.</b> Published service unreachable. NAT destination rule hits: 0. ISP-side test public address ke liye koi ARP reply nahi dikhata. Proxy-ARP missing hai. Jodne ke baad rule hits chalte hain, session dikhta hai aur policy ke hits aate hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> NAT aur policy ek saath badalna. Pata nahi chalta kaunse change ne theek kiya. Ek cheez badlo, sessions clear karo, test karo, counters padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Purane sessions apna purana translation rakhte hain. NAT change ke baad nateeja judge karne se pehle sessions clear karo.</p></div>
<div class="scn"><h4>NAT ek hi taraf chalta hai</h4><p>Server tak inbound access chala; uske outbound connections shared PAT address use karte the aur partner ne reject kiye. Server ko static NAT rule chahiye tha taaki reverse static NAT general source rule se pehle lage.</p><p><b>Lesson:</b> bidirectional pehchaan ke liye static NAT chahiye.</p></div>
<div class="iv"><p class="q">"NAT wali service band ho gayi. Kahan se shuru karoge?"</p><p>Main packet ko follow karta hoon: ARP aur arrival, kaunse NAT rule ke hits hain, zones, translated addresses par policy, session In aur Out lines, phir return path aur pool statistics. Dobara test se pehle sessions clear karta hoon.</p></div>
<h3>Summary aur exam checklist</h3>
<ul><li>Order: static, destination, route, policy, reverse static, source.</li><li>Interface NAT = egress address par PAT; pools default mein PAT use karte hain; <code>port no-translation</code> one-to-one hai aur khatam ho sakta hai; overflow-pool bachata hai.</li><li>Destination NAT ko pool aur rule set chahiye; public address interface subnet mein ho to proxy-ARP.</li><li>Static NAT bidirectional hai, prefix lengths barabar, doosron par priority.</li><li>Policy translated destination aur original source dekhti hai.</li></ul>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show security nat source rule all</code></td><td>Source rules aur hits</td></tr>
<tr><td><code>show security nat source pool all</code></td><td>Pools, PAT haan/nahi, hits</td></tr>
<tr><td><code>show security nat destination rule all</code></td><td>Destination rules aur hits</td></tr>
<tr><td><code>show security nat static rule all</code></td><td>Static rules aur hits</td></tr>
<tr><td><code>show security flow session</code></td><td>Translations ke saath In aur Out lines</td></tr></table>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Packet order mein handovers check karo.</li><li>Rule hits, policy hits aur sessions batate hain kahan ruka.</li><li>NAT changes ke baad sessions clear karo.</li></ul></div>`}};export{e as default};