var e={id:`native-vlan-allowed`,h:{en:`Native VLAN issues, allowed lists and reading show interfaces trunk`,hi:`Native VLAN issues, allowed lists aur show interfaces trunk padhna`},body:{en:`
<p>Back to the city highway. Every bus carries a coloured sticker, except buses of one "house colour" that drive without a sticker. At each end of the highway a marshal puts sticker-less buses on the house route. If the two marshals disagree about the house colour, a sticker-less green bus leaving one end becomes a blue bus at the other end. No alarm rings; passengers just arrive in the wrong district. That is a <b>native VLAN mismatch</b>.</p>

<h3>What the native VLAN really is</h3>
<p>On an 802.1Q trunk, frames in the <b>native VLAN</b> are sent <b>untagged</b>, and any untagged frame received is placed into the native VLAN. The default native VLAN is 1. It exists for backward compatibility with devices that do not understand tags. Each end decides independently which VLAN is native; nothing in 802.1Q makes them agree.</p>
<pre class="code">SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport trunk native vlan 999      <span class="c">! an unused VLAN, same on both ends</span>
SW1(config)# vlan dot1q tag native                     <span class="c">! global: tag even the native VLAN</span></pre>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Native VLAN mismatch">
<rect x="40" y="60" width="150" height="56" rx="8" fill="#bae6fd"/><text x="115" y="84" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="115" y="102" text-anchor="middle" class="svg-muted" font-size="12">native VLAN 10</text>
<rect x="450" y="60" width="150" height="56" rx="8" fill="#bae6fd"/><text x="525" y="84" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="525" y="102" text-anchor="middle" class="svg-muted" font-size="12">native VLAN 1</text>
<line x1="190" y1="88" x2="450" y2="88" stroke="#64748b" stroke-width="3"/>
<rect x="255" y="70" width="130" height="36" rx="6" fill="#fed7aa"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="12">untagged frame</text>
<text x="115" y="150" text-anchor="middle" class="svg-accent" font-size="12">sent from VLAN 10</text>
<text x="525" y="150" text-anchor="middle" class="svg-accent" font-size="12">lands in VLAN 1</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">VLAN 10 and VLAN 1 silently merge across this link</text>
</svg><p class="cap">Each end maps untagged frames to its own native VLAN; if they differ, two VLANs become one broadcast domain.</p></div>

<h3>How you detect a mismatch</h3>
<ul>
<li><b>CDP</b> compares the native VLAN in its advertisements and logs:<br><code>%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/1 (10), with SW2 GigabitEthernet0/1 (1).</code></li>
<li><b>PVST+ / Rapid PVST+</b> tags a copy of each VLAN's BPDU with a PVID TLV. A switch that receives a BPDU for one VLAN on a different VLAN blocks the port for both VLANs:<br><code>%SPANTREE-2-RECV_PVID_ERR: Received BPDU with inconsistent peer vlan id 1 on GigabitEthernet0/1 VLAN10.</code><br>The port shows <code>*PVID_Inc</code> in <code>show spanning-tree</code> and appears in <code>show spanning-tree inconsistentports</code>.</li>
<li><b>MST</b> sends a single untagged BPDU without per-VLAN information, so it has no PVID check. On an MST campus the only warning is CDP (or LLDP). Keep CDP/LLDP on inter-switch links.</li>
</ul>

<h3>The security side: double tagging</h3>
<p>An attacker on an access port in the native VLAN crafts a frame with two tags: outer = native VLAN, inner = victim VLAN 30. The first switch removes the outer tag and, because that VLAN is the trunk's native VLAN, sends the frame out of the trunk without adding a tag, so the inner tag is now the only tag. The next switch reads the inner tag and delivers the frame into VLAN 30. It is one-way, but it crosses the VLAN boundary. Defences: never put users in the native VLAN, set the native VLAN to an unused one, and <code>vlan dot1q tag native</code>. Turning off DTP (chapter 3) stops the other VLAN-hopping method, switch spoofing.</p>

<h3>The allowed list: add, remove, replace</h3>
<pre class="code">SW1(config-if)# switchport trunk allowed vlan 10,20        <span class="c">! REPLACES the list</span>
SW1(config-if)# switchport trunk allowed vlan add 30       <span class="c">! appends</span>
SW1(config-if)# switchport trunk allowed vlan remove 20    <span class="c">! removes one</span>
SW1(config-if)# switchport trunk allowed vlan except 99    <span class="c">! all but 99</span></pre>
<p>Forgetting the word <code>add</code> is one of the most common self-inflicted outages in campus networks: "allow VLAN 50 on the uplink" becomes "allow only VLAN 50".</p>

<h3>Reading show interfaces trunk top to bottom</h3>
<pre class="out">SW3# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      1
Gi0/2       on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/1       1-4094
Gi0/2       1-4094

Port        Vlans allowed and active in management domain
Gi0/1       1,10,20,30,40
Gi0/2       1,10,20,30,40

Port        Vlans in spanning tree forwarding state and not pruned
<span class="hl">Gi0/1       1,10,20</span>
<span class="hl">Gi0/2       30,40</span></pre>
<p>Four sections, four questions. <b>Mode/Status</b>: is it trunking at all, and with which native VLAN? <b>Allowed</b>: what the configuration permits. <b>Allowed and active</b>: allowed <b>and</b> the VLAN exists on this switch; a VLAN missing here was never created locally (or was deleted by VTP). <b>Forwarding and not pruned</b>: what really flows; a VLAN missing here is blocked by spanning tree or pruned by VTP. In Lab 1 after the MST change, SW3 forwards VLANs 1,10,20 (IST and MST1) toward SW1 and VLANs 30,40 (MST2) toward SW2: load sharing, visible in one command.</p>

<div class="eg"><p><b>Worked example: pruning versus MST.</b> In the lab region, VLANs 10 and 20 share instance 1. SW3 forwards instance 1 on Gi0/1 (to SW1) and blocks it on Gi0/2. An engineer "cleans up" the SW3-SW1 trunk with <code>switchport trunk allowed vlan remove 20</code>, assuming VLAN 20 will simply take the other uplink. It will not: MST blocks <b>ports per instance</b>, not per VLAN, and Gi0/2 stays blocked for instance 1 because VLAN 10 still uses Gi0/1. VLAN 20 on SW3 is now cut off. Rule: with MST, every VLAN of an instance must be allowed on every trunk that carries that instance.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the native VLAN on one end "to test" and forgetting the other. With MST nothing blocks, so the mismatch can live for months while VLANs leak. Configure the native VLAN on both ends in the same change and verify with CDP.</p></div>

<div class="exam"><p><b>Exam trap.</b> A VLAN that appears in "allowed" but not in "allowed and active" does not exist in the local VLAN database. A VLAN that appears in "allowed and active" but not in "forwarding and not pruned" is blocked by STP or pruned by VTP. Know which section answers which question.</p></div>

<div class="scn"><h4>Printers answering in the wrong VLAN</h4><p>A hospital found printers from VLAN 60 appearing in the DHCP logs of the VLAN 1 scope. Nothing was down. On the link between two access switches, CDP logged <code>NATIVE_VLAN_MISMATCH ... (60), with ... (1)</code>: someone had set native VLAN 60 on one end while troubleshooting printers weeks earlier. The campus ran MST, so no port was blocked. The engineer set both ends to native VLAN 999, enabled <code>vlan dot1q tag native</code>, and the stray DHCP leases stopped.</p><p><b>Lesson:</b> a native VLAN mismatch is a leak, not an outage; watch CDP/LLDP logs, especially under MST.</p></div>

<div class="iv"><p class="q">"What happens with a native VLAN mismatch, and why is it worse with MST than with Rapid PVST+?"</p><p>Strong answer: untagged frames from one VLAN arrive in a different VLAN on the other side, merging two broadcast domains. Rapid PVST+ detects it through the PVID in its SSTP BPDUs and puts the port into PVID-inconsistent blocking for both VLANs; MST sends one untagged BPDU with no per-VLAN field, so only CDP/LLDP warn you and the leak persists. Recommend matching unused native VLANs and <code>vlan dot1q tag native</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Native VLAN frames travel untagged; each end chooses its own native VLAN, so they must be configured to match.</li>
<li>Detection: CDP log always; PVST+ PVID inconsistency blocks; MST has no PVID check.</li>
<li>Use an unused native VLAN and <code>vlan dot1q tag native</code> to stop double-tagging attacks.</li>
<li>Always use <code>add</code>/<code>remove</code> when editing an allowed list.</li>
<li>show interfaces trunk: allowed, then exists locally, then actually forwarding.</li>
</ul></div>
`,hi:`
<p>Wapas shehar ke highway par chalo. Har bus par rangeen sticker hai, sivaay ek "house colour" ki buses ke jo bina sticker ke chalti hain. Highway ke dono ends par ek marshal bina sticker wali buses ko house route par daalta hai. Agar dono marshals house colour par agree nahi karte, to ek end se nikli bina sticker ki hari bus doosre end par neeli bus ban jaati hai. Koi alarm nahi bajta; passengers bas galat area mein pahunch jaate hain. Yahi hai <b>native VLAN mismatch</b>.</p>

<h3>Native VLAN asal mein kya hai</h3>
<p>802.1Q trunk par <b>native VLAN</b> ke frames <b>untagged</b> bheje jaate hain, aur receive hua koi bhi untagged frame native VLAN mein daala jaata hai. Default native VLAN 1 hai. Yeh un devices ke saath backward compatibility ke liye hai jo tags nahi samajhte. Har end apna native VLAN khud decide karta hai; 802.1Q mein aisa kuch nahi jo unhe agree karwaaye.</p>
<pre class="code">SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport trunk native vlan 999      <span class="c">! unused VLAN, dono ends par same</span>
SW1(config)# vlan dot1q tag native                     <span class="c">! global: native VLAN ko bhi tag karo</span></pre>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Native VLAN mismatch">
<rect x="40" y="60" width="150" height="56" rx="8" fill="#bae6fd"/><text x="115" y="84" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="115" y="102" text-anchor="middle" class="svg-muted" font-size="12">native VLAN 10</text>
<rect x="450" y="60" width="150" height="56" rx="8" fill="#bae6fd"/><text x="525" y="84" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="525" y="102" text-anchor="middle" class="svg-muted" font-size="12">native VLAN 1</text>
<line x1="190" y1="88" x2="450" y2="88" stroke="#64748b" stroke-width="3"/>
<rect x="255" y="70" width="130" height="36" rx="6" fill="#fed7aa"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="12">untagged frame</text>
<text x="115" y="150" text-anchor="middle" class="svg-accent" font-size="12">VLAN 10 se bheja</text>
<text x="525" y="150" text-anchor="middle" class="svg-accent" font-size="12">VLAN 1 mein pahuncha</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Is link par VLAN 10 aur VLAN 1 chupchaap mil jaate hain</text>
</svg><p class="cap">Har end untagged frames ko apne native VLAN mein map karta hai; agar dono alag hain, to do VLANs ek broadcast domain ban jaate hain.</p></div>

<h3>Mismatch kaise pakadte hain</h3>
<ul>
<li><b>CDP</b> apne advertisements mein native VLAN compare karta hai aur log karta hai:<br><code>%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/1 (10), with SW2 GigabitEthernet0/1 (1).</code></li>
<li><b>PVST+ / Rapid PVST+</b> har VLAN ke BPDU ki ek copy ko PVID TLV ke saath tag karta hai. Jo switch ek VLAN ka BPDU kisi doosre VLAN par receive kare, woh port ko dono VLANs ke liye block kar deta hai:<br><code>%SPANTREE-2-RECV_PVID_ERR: Received BPDU with inconsistent peer vlan id 1 on GigabitEthernet0/1 VLAN10.</code><br>Port <code>show spanning-tree</code> mein <code>*PVID_Inc</code> dikhata hai aur <code>show spanning-tree inconsistentports</code> mein aata hai.</li>
<li><b>MST</b> per-VLAN info ke bina ek hi untagged BPDU bhejta hai, isliye usme PVID check nahi hai. MST campus par sirf CDP (ya LLDP) warning deta hai. Inter-switch links par CDP/LLDP on rakho.</li>
</ul>

<h3>Security side: double tagging</h3>
<p>Native VLAN ke access port par baitha attacker do tags wala frame banata hai: outer = native VLAN, inner = victim VLAN 30. Pehla switch outer tag hata deta hai aur, kyunki woh VLAN trunk ka native VLAN hai, frame ko bina naya tag lagaye trunk se bhej deta hai, isliye ab inner tag hi akela tag bachta hai. Agla switch inner tag padhta hai aur frame VLAN 30 mein deliver kar deta hai. Yeh one-way hai, lekin VLAN boundary cross karta hai. Bachav: users ko kabhi native VLAN mein mat rakho, native VLAN ko unused VLAN par set karo, aur <code>vlan dot1q tag native</code>. DTP band karna (chapter 3) doosra VLAN-hopping tareeka, switch spoofing, rokta hai.</p>

<h3>Allowed list: add, remove, replace</h3>
<pre class="code">SW1(config-if)# switchport trunk allowed vlan 10,20        <span class="c">! list ko REPLACE karta hai</span>
SW1(config-if)# switchport trunk allowed vlan add 30       <span class="c">! jodta hai</span>
SW1(config-if)# switchport trunk allowed vlan remove 20    <span class="c">! ek hatata hai</span>
SW1(config-if)# switchport trunk allowed vlan except 99    <span class="c">! 99 ke alawa sab</span></pre>
<p><code>add</code> shabd bhoolna campus networks mein khud se kiye gaye sabse common outages mein se ek hai: "uplink par VLAN 50 allow karo" ban jaata hai "sirf VLAN 50 allow karo".</p>

<h3>show interfaces trunk upar se neeche padhna</h3>
<pre class="out">SW3# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      1
Gi0/2       on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/1       1-4094
Gi0/2       1-4094

Port        Vlans allowed and active in management domain
Gi0/1       1,10,20,30,40
Gi0/2       1,10,20,30,40

Port        Vlans in spanning tree forwarding state and not pruned
<span class="hl">Gi0/1       1,10,20</span>
<span class="hl">Gi0/2       30,40</span></pre>
<p>Chaar sections, chaar sawaal. <b>Mode/Status</b>: kya yeh trunk kar bhi raha hai, aur kis native VLAN ke saath? <b>Allowed</b>: configuration kya permit karti hai. <b>Allowed and active</b>: allowed <b>aur</b> VLAN is switch par exist karta hai; yahan se gayab VLAN kabhi locally bana hi nahi (ya VTP ne delete kar diya). <b>Forwarding and not pruned</b>: asal mein kya flow ho raha hai; yahan se gayab VLAN spanning tree se blocked hai ya VTP se pruned. Lab 1 mein MST change ke baad SW3 VLANs 1,10,20 (IST aur MST1) SW1 ki taraf aur VLANs 30,40 (MST2) SW2 ki taraf forward karta hai: load sharing, ek hi command mein dikhta hai.</p>

<div class="eg"><p><b>Worked example: pruning vs MST.</b> Lab region mein VLANs 10 aur 20 instance 1 share karte hain. SW3 instance 1 ko Gi0/1 (SW1 ki taraf) par forward karta hai aur Gi0/2 par block. Ek engineer SW3-SW1 trunk ko <code>switchport trunk allowed vlan remove 20</code> se "saaf" karta hai, yeh soch kar ki VLAN 20 bas doosra uplink le lega. Aisa nahi hoga: MST <b>ports ko per instance</b> block karta hai, per VLAN nahi, aur Gi0/2 instance 1 ke liye blocked hi rehta hai kyunki VLAN 10 abhi bhi Gi0/1 use karta hai. SW3 par VLAN 20 ab kat gaya. Rule: MST mein, kisi instance ka har VLAN har us trunk par allowed hona chahiye jo woh instance le jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek end par "test karne ke liye" native VLAN badalna aur doosra bhool jaana. MST mein kuch block nahi hota, isliye mismatch mahino tak zinda reh sakta hai jabki VLANs leak hote rehte hain. Native VLAN dono ends par ek hi change mein configure karo aur CDP se verify karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jo VLAN "allowed" mein dikhe lekin "allowed and active" mein nahi, woh local VLAN database mein exist nahi karta. Jo VLAN "allowed and active" mein dikhe lekin "forwarding and not pruned" mein nahi, woh STP se blocked ya VTP se pruned hai. Kaunsa section kis sawaal ka jawab deta hai, yeh yaad rakho.</p></div>

<div class="scn"><h4>Galat VLAN mein jawab dete printers</h4><p>Ek hospital ne dekha ki VLAN 60 ke printers VLAN 1 scope ke DHCP logs mein dikh rahe the. Kuch down nahi tha. Do access switches ke beech ke link par CDP ne <code>NATIVE_VLAN_MISMATCH ... (60), with ... (1)</code> log kiya: kisi ne hafton pehle printers troubleshoot karte waqt ek end par native VLAN 60 set kar diya tha. Campus MST chala raha tha, isliye koi port block nahi hua. Engineer ne dono ends native VLAN 999 par set kiye, <code>vlan dot1q tag native</code> enable kiya, aur bhatke hue DHCP leases ruk gaye.</p><p><b>Seekh:</b> native VLAN mismatch leak hai, outage nahi; CDP/LLDP logs dekhte raho, khaas kar MST mein.</p></div>

<div class="iv"><p class="q">"Native VLAN mismatch se kya hota hai, aur yeh Rapid PVST+ se zyada MST mein bura kyun hai?"</p><p>Strong answer: ek VLAN ke untagged frames doosri taraf alag VLAN mein pahunchte hain, do broadcast domains mil jaate hain. Rapid PVST+ ise apne SSTP BPDUs ke PVID se pakadta hai aur port ko dono VLANs ke liye PVID-inconsistent blocking mein daal deta hai; MST ek untagged BPDU bhejta hai jisme koi per-VLAN field nahi, isliye sirf CDP/LLDP warning dete hain aur leak chalta rehta hai. Matching unused native VLANs aur <code>vlan dot1q tag native</code> recommend karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Native VLAN frames untagged jaate hain; har end apna native VLAN chunta hai, isliye unhe match karke configure karna padta hai.</li>
<li>Detection: CDP log hamesha; PVST+ PVID inconsistency block karta hai; MST mein PVID check nahi hai.</li>
<li>Double-tagging attacks rokne ke liye unused native VLAN aur <code>vlan dot1q tag native</code> use karo.</li>
<li>Allowed list edit karte waqt hamesha <code>add</code>/<code>remove</code> use karo.</li>
<li>show interfaces trunk: allowed, phir locally exist karta hai, phir asal mein forwarding.</li>
</ul></div>
`}};export{e as default};