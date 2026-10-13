var e={id:`psec-basics`,h:{en:`Port security: secure MACs, maximum and sticky learning`,hi:`Port security: secure MACs, maximum aur sticky learning`},body:{en:`
<p>Think of a hotel room key card. The card opens one room, and only for the guests registered to it. If a stranger tries the door, the lock refuses and the front desk is alerted. <b>Port security</b> turns a switch port into that door: it keeps a short list of <b>secure MAC addresses</b> that may send frames into the port, and it reacts when any other MAC tries.</p>

<h3>How port security works</h3>
<p>Every frame that enters a port carries a source MAC address. With port security enabled, the switch checks that source MAC against the port's secure list before learning or forwarding it:</p>
<ul>
<li>If the MAC is already secure on this port, the frame is forwarded normally.</li>
<li>If the MAC is new and the port has not reached its <b>maximum</b>, the MAC is added to the secure list (and to the MAC table).</li>
<li>If the MAC is new and the maximum is already reached, that is a <b>violation</b>.</li>
<li>If a MAC that is secure on one port appears on another secure port in the same VLAN, that is also a violation.</li>
</ul>
<p>Because the list has a fixed size, a MAC flooding tool on this port cannot fill the CAM table. After the first one or two MACs, everything else is rejected.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Port security decision">
<rect x="10" y="80" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="75" y="107" text-anchor="middle" class="svg-ink" font-size="13">Frame arrives</text>
<line x1="140" y1="102" x2="190" y2="102" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="72" width="160" height="60" rx="8" fill="#bae6fd"/><text x="270" y="97" text-anchor="middle" class="svg-ink" font-size="13">Source MAC</text><text x="270" y="117" text-anchor="middle" class="svg-ink" font-size="13">already secure?</text>
<line x1="350" y1="90" x2="420" y2="40" stroke="#64748b" stroke-width="2"/><text x="372" y="55" class="svg-muted" font-size="12">yes</text>
<rect x="420" y="15" width="210" height="44" rx="8" fill="#bbf7d0"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Forward</text>
<line x1="350" y1="102" x2="420" y2="102" stroke="#64748b" stroke-width="2"/><text x="360" y="96" class="svg-muted" font-size="12">no</text>
<rect x="420" y="80" width="210" height="44" rx="8" fill="#fde68a"/><text x="525" y="107" text-anchor="middle" class="svg-ink" font-size="13">Below maximum? Learn it</text>
<line x1="350" y1="115" x2="420" y2="165" stroke="#64748b" stroke-width="2"/><text x="360" y="155" class="svg-muted" font-size="12">max reached</text>
<rect x="420" y="145" width="210" height="44" rx="8" fill="#fed7aa"/><text x="525" y="172" text-anchor="middle" class="svg-ink" font-size="13">Violation action</text>
</svg><p class="cap">Every incoming source MAC is either already secure, learned while below the maximum, or a violation.</p></div>

<h3>Three kinds of secure MAC address</h3>
<table class="cmp"><tr><th>Type</th><th>How it gets there</th><th>After a reload</th></tr>
<tr><td><b>Static</b></td><td>You type it: <code>switchport port-security mac-address 0050.7966.0a01</code></td><td>Kept, because it is in the configuration</td></tr>
<tr><td><b>Dynamic</b></td><td>Learned from traffic (the default)</td><td>Lost; relearned from the first MACs that talk</td></tr>
<tr><td><b>Sticky</b></td><td>Learned from traffic, then written into the running-config</td><td>Kept only if you saved the running-config</td></tr>
</table>
<p><b>Sticky</b> learning is the practical favourite. You do not have to collect MAC addresses by hand; you let the right device talk once, the switch writes <code>switchport port-security mac-address sticky 0050.7966.0a01</code> into the running-config, and after <code>copy running-config startup-config</code> the port is locked to that device permanently.</p>

<h3>The defaults you must remember</h3>
<ul>
<li>Port security is <b>disabled</b> on every port until you enable it.</li>
<li>When enabled, the <b>maximum is 1</b> secure MAC.</li>
<li>The <b>violation mode is shutdown</b> (the port goes err-disabled).</li>
<li>Aging is <b>off</b> (aging time 0), so learned addresses stay until the port goes down or you clear them.</li>
<li>It works only on a port <b>statically</b> set to access or trunk. A port left in the default dynamic mode rejects the command.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The Godavari Bank branch reception PC (PC1, MAC 0050.7966.0a01, IP 10.5.5.11) sits on SW1 Gi0/1. The switch SVI is 10.5.5.254. Goal: only PC1 may ever use Gi0/1, and the switch must remember it after a reboot. That means maximum 1 (default), sticky learning, violation shutdown (default), then a saved configuration.</p></div>

<h3>Configuration walkthrough</h3>
<pre class="code">SW1(config)# interface g0/1
SW1(config-if)# switchport mode access                      <span class="c">! static mode first</span>
SW1(config-if)# switchport port-security                    <span class="c">! enable; max 1, shutdown</span>
SW1(config-if)# switchport port-security mac-address sticky <span class="c">! learn and write to config</span>
SW1(config-if)# end
<span class="c">! let PC1 talk once: from PC1, ping 10.5.5.254</span>
SW1# copy running-config startup-config</pre>
<p>If you type <code>switchport port-security</code> first on a port in dynamic auto, IOS answers <code>Command rejected: GigabitEthernet0/1 is a dynamic port.</code> Set the mode, then try again. To allow more devices, add <code>switchport port-security maximum 2</code>; to pre-register a device, add a static entry with <code>switchport port-security mac-address H.H.H</code>.</p>

<h3>Verification</h3>
<pre class="out">SW1# show port-security interface g0/1
Port Security              : Enabled
<span class="hl">Port Status                : Secure-up</span>
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
<span class="hl">Maximum MAC Addresses      : 1</span>
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
<span class="hl">Sticky MAC Addresses       : 1</span>
Last Source Address:Vlan   : 0050.7966.0a01:1
Security Violation Count   : 0

SW1# show port-security address
               Secure Mac Address Table
-----------------------------------------------------------------------------
Vlan    Mac Address       Type                          Ports   Remaining Age
                                                                   (mins)
----    -----------       ----                          -----   -------------
<span class="hl">   1    0050.7966.0a01    SecureSticky                  Gi0/1        -</span>
-----------------------------------------------------------------------------

SW1# show running-config interface g0/1
interface GigabitEthernet0/1
 description RECEPTION
 switchport mode access
 switchport port-security
 switchport port-security mac-address sticky
<span class="hl"> switchport port-security mac-address sticky 0050.7966.0a01</span></pre>
<p>Read <b>Port Status</b> first: <code>Secure-up</code> means healthy, <code>Secure-shutdown</code> means a violation err-disabled the port, and <code>Secure-down</code> means port security is on but the link is down.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting to save after sticky learning; after a reload the port learns whatever talks first. (2) Setting maximum 1 on a desk with an IP phone and a PC behind it; the second MAC causes a violation. Use at least 2, or 3 on platforms that count the phone in both VLANs. (3) Enabling port security on the uplink trunk with default settings; the port sees many MACs and shuts down immediately.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Sticky MACs survive a reboot" is only true if the running-config was saved. Sticky addresses are added to the <b>running</b>-config, not the startup-config. Also remember: the command is rejected on a dynamic port, and the default maximum is 1.</p></div>

<div class="scn"><h4>The printer that moved</h4><p>A hospital locked every ward port with sticky port security and saved the config. Weeks later, facilities moved a label printer from port Gi0/12 to Gi0/14 during a desk shuffle. The printer's MAC was still sticky on Gi0/12, so when it talked on Gi0/14 the switch saw a secure MAC on a different secure port and err-disabled Gi0/14. The engineer ran <code>show port-security address</code>, found the old sticky entry, removed it with <code>clear port-security sticky interface g0/12</code>, bounced Gi0/14 and saved.</p><p><b>Lesson:</b> port security binds a device to a port. Physical moves need a matching change on the switch, so document them in the move process.</p></div>

<div class="iv"><p class="q">"What is the difference between static, dynamic and sticky secure MAC addresses?"</p><p>Strong answer: static ones are typed into the config and always survive a reload; dynamic ones are learned and lost on reload or link down; sticky ones are learned but written into the running-config, so they survive only once saved. Add the defaults (maximum 1, violation shutdown, needs a static access or trunk port) and a real use: sticky for fixed desks so you do not have to collect MACs by hand.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port security limits which and how many source MACs may use a port, which also stops MAC flooding.</li>
<li>Defaults: disabled, maximum 1, violation shutdown, aging off; requires a static access or trunk port.</li>
<li>Secure MACs are static, dynamic or sticky; sticky ones go into the running-config and need saving.</li>
<li>A violation is a new MAC above the maximum, or a secure MAC appearing on another secure port.</li>
<li>Verify with show port-security interface, show port-security address and the running-config.</li>
</ul></div>
`,hi:`
<p>Hotel room ka key card socho. Card ek hi room kholta hai, aur sirf usmein registered guests ke liye. Agar koi ajnabi darwaza kholne ki koshish kare, to lock mana kar deta hai aur front desk ko alert jaata hai. <b>Port security</b> switch port ko wahi darwaza bana deta hai: woh <b>secure MAC addresses</b> ki ek chhoti list rakhta hai jo port mein frames bhej sakte hain, aur jab koi aur MAC koshish karta hai to react karta hai.</p>

<h3>Port security kaise kaam karta hai</h3>
<p>Port mein aane wale har frame mein ek source MAC address hota hai. Port security enable hone par switch us source MAC ko seekhne ya forward karne se pehle port ki secure list se check karta hai:</p>
<ul>
<li>Agar MAC is port par pehle se secure hai, frame normally forward hota hai.</li>
<li>Agar MAC naya hai aur port apne <b>maximum</b> tak nahi pahuncha, MAC secure list (aur MAC table) mein jud jaata hai.</li>
<li>Agar MAC naya hai aur maximum pehle se poora hai, to yeh <b>violation</b> hai.</li>
<li>Agar jo MAC ek port par secure hai woh same VLAN ke kisi dusre secure port par dikhe, to yeh bhi violation hai.</li>
</ul>
<p>Kyunki list ka size fixed hai, is port par MAC flooding tool CAM table nahi bhar sakta. Pehle ek ya do MACs ke baad baaki sab reject ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Port security decision">
<rect x="10" y="80" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="75" y="107" text-anchor="middle" class="svg-ink" font-size="13">Frame aata hai</text>
<line x1="140" y1="102" x2="190" y2="102" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="72" width="160" height="60" rx="8" fill="#bae6fd"/><text x="270" y="97" text-anchor="middle" class="svg-ink" font-size="13">Source MAC</text><text x="270" y="117" text-anchor="middle" class="svg-ink" font-size="13">pehle se secure?</text>
<line x1="350" y1="90" x2="420" y2="40" stroke="#64748b" stroke-width="2"/><text x="372" y="55" class="svg-muted" font-size="12">haan</text>
<rect x="420" y="15" width="210" height="44" rx="8" fill="#bbf7d0"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Forward</text>
<line x1="350" y1="102" x2="420" y2="102" stroke="#64748b" stroke-width="2"/><text x="360" y="96" class="svg-muted" font-size="12">nahi</text>
<rect x="420" y="80" width="210" height="44" rx="8" fill="#fde68a"/><text x="525" y="107" text-anchor="middle" class="svg-ink" font-size="13">Maximum se kam? Seekho</text>
<line x1="350" y1="115" x2="420" y2="165" stroke="#64748b" stroke-width="2"/><text x="360" y="155" class="svg-muted" font-size="12">max poora</text>
<rect x="420" y="145" width="210" height="44" rx="8" fill="#fed7aa"/><text x="525" y="172" text-anchor="middle" class="svg-ink" font-size="13">Violation action</text>
</svg><p class="cap">Har aane wala source MAC ya to pehle se secure hai, ya maximum se neeche hone par seekha jaata hai, ya violation hai.</p></div>

<h3>Secure MAC address ke teen types</h3>
<table class="cmp"><tr><th>Type</th><th>Kaise aata hai</th><th>Reload ke baad</th></tr>
<tr><td><b>Static</b></td><td>Aap type karte ho: <code>switchport port-security mac-address 0050.7966.0a01</code></td><td>Rehta hai, kyunki configuration mein hai</td></tr>
<tr><td><b>Dynamic</b></td><td>Traffic se seekha jaata hai (default)</td><td>Kho jaata hai; jo MACs pehle bolte hain unse dobara seekha jaata hai</td></tr>
<tr><td><b>Sticky</b></td><td>Traffic se seekha jaata hai, phir running-config mein likha jaata hai</td><td>Sirf tab rehta hai jab aapne running-config save kiya ho</td></tr>
</table>
<p><b>Sticky</b> learning practical favourite hai. Aapko MAC addresses haath se collect nahi karne padte; aap sahi device ko ek baar bolne dete ho, switch running-config mein <code>switchport port-security mac-address sticky 0050.7966.0a01</code> likh deta hai, aur <code>copy running-config startup-config</code> ke baad port us device par hamesha ke liye lock ho jaata hai.</p>

<h3>Defaults jo yaad rakhne hain</h3>
<ul>
<li>Port security har port par tab tak <b>disabled</b> hai jab tak aap enable na karo.</li>
<li>Enable hone par <b>maximum 1</b> secure MAC hota hai.</li>
<li><b>Violation mode shutdown</b> hota hai (port err-disabled ho jaata hai).</li>
<li>Aging <b>off</b> hoti hai (aging time 0), isliye seekhe gaye addresses tab tak rehte hain jab tak port down na ho ya aap clear na karo.</li>
<li>Yeh sirf us port par chalta hai jo <b>statically</b> access ya trunk set ho. Default dynamic mode wala port command reject kar deta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Godavari Bank branch ka reception PC (PC1, MAC 0050.7966.0a01, IP 10.5.5.11) SW1 Gi0/1 par hai. Switch SVI 10.5.5.254 hai. Goal: Gi0/1 ko hamesha sirf PC1 use kare, aur reboot ke baad bhi switch ko yaad rahe. Iska matlab maximum 1 (default), sticky learning, violation shutdown (default), phir saved configuration.</p></div>

<h3>Configuration walkthrough</h3>
<pre class="code">SW1(config)# interface g0/1
SW1(config-if)# switchport mode access                      <span class="c">! pehle static mode</span>
SW1(config-if)# switchport port-security                    <span class="c">! enable; max 1, shutdown</span>
SW1(config-if)# switchport port-security mac-address sticky <span class="c">! seekho aur config mein likho</span>
SW1(config-if)# end
<span class="c">! PC1 ko ek baar bolne do: PC1 se ping 10.5.5.254</span>
SW1# copy running-config startup-config</pre>
<p>Agar aap dynamic auto wale port par pehle <code>switchport port-security</code> type karte ho, to IOS jawab deta hai <code>Command rejected: GigabitEthernet0/1 is a dynamic port.</code> Mode set karo, phir dobara try karo. Zyada devices allow karne ke liye <code>switchport port-security maximum 2</code> jodo; kisi device ko pehle se register karne ke liye <code>switchport port-security mac-address H.H.H</code> se static entry jodo.</p>

<h3>Verification</h3>
<pre class="out">SW1# show port-security interface g0/1
Port Security              : Enabled
<span class="hl">Port Status                : Secure-up</span>
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
<span class="hl">Maximum MAC Addresses      : 1</span>
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
<span class="hl">Sticky MAC Addresses       : 1</span>
Last Source Address:Vlan   : 0050.7966.0a01:1
Security Violation Count   : 0

SW1# show port-security address
               Secure Mac Address Table
-----------------------------------------------------------------------------
Vlan    Mac Address       Type                          Ports   Remaining Age
                                                                   (mins)
----    -----------       ----                          -----   -------------
<span class="hl">   1    0050.7966.0a01    SecureSticky                  Gi0/1        -</span>
-----------------------------------------------------------------------------

SW1# show running-config interface g0/1
interface GigabitEthernet0/1
 description RECEPTION
 switchport mode access
 switchport port-security
 switchport port-security mac-address sticky
<span class="hl"> switchport port-security mac-address sticky 0050.7966.0a01</span></pre>
<p>Pehle <b>Port Status</b> padho: <code>Secure-up</code> matlab healthy, <code>Secure-shutdown</code> matlab violation ne port err-disable kar diya, aur <code>Secure-down</code> matlab port security on hai lekin link down hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Sticky learning ke baad save karna bhool jaana; reload ke baad port jo pehle bolta hai use seekh leta hai. (2) Aisi desk par maximum 1 set karna jahan IP phone aur uske peeche PC hai; doosra MAC violation karata hai. Kam se kam 2 use karo, ya un platforms par 3 jo phone ko dono VLANs mein ginte hain. (3) Uplink trunk par default settings ke saath port security enable karna; port bahut saare MACs dekhta hai aur turant shut down ho jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Sticky MACs reboot ke baad bhi rehte hain" sirf tab sach hai jab running-config save hua ho. Sticky addresses <b>running</b>-config mein jaate hain, startup-config mein nahi. Yeh bhi yaad rakho: dynamic port par command reject hota hai, aur default maximum 1 hai.</p></div>

<div class="scn"><h4>Printer jo shift hua</h4><p>Ek hospital ne har ward port ko sticky port security se lock kiya aur config save kiya. Hafton baad facilities team ne desk shuffle ke dauraan ek label printer ko port Gi0/12 se Gi0/14 par shift kar diya. Printer ka MAC abhi bhi Gi0/12 par sticky tha, isliye jab woh Gi0/14 par bola to switch ne ek secure MAC ko dusre secure port par dekha aur Gi0/14 ko err-disable kar diya. Engineer ne <code>show port-security address</code> chalaya, purani sticky entry mili, use <code>clear port-security sticky interface g0/12</code> se hataya, Gi0/14 bounce kiya aur save kiya.</p><p><b>Seekh:</b> port security device ko port se baandh deta hai. Physical moves ke saath switch par bhi matching change chahiye, isliye unhe move process mein document karo.</p></div>

<div class="iv"><p class="q">"Static, dynamic aur sticky secure MAC addresses mein kya farak hai?"</p><p>Strong answer: static wale config mein type hote hain aur hamesha reload ke baad rehte hain; dynamic wale seekhe jaate hain aur reload ya link down par kho jaate hain; sticky wale seekhe jaate hain lekin running-config mein likhe jaate hain, isliye save hone ke baad hi reload survive karte hain. Defaults jodo (maximum 1, violation shutdown, static access ya trunk port chahiye) aur ek real use batao: fixed desks ke liye sticky taaki MACs haath se collect na karne padein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port security limit karta hai ki kaunse aur kitne source MACs ek port use kar sakte hain, jo MAC flooding bhi rokta hai.</li>
<li>Defaults: disabled, maximum 1, violation shutdown, aging off; static access ya trunk port chahiye.</li>
<li>Secure MACs static, dynamic ya sticky hote hain; sticky wale running-config mein jaate hain aur save karne padte hain.</li>
<li>Violation matlab maximum ke upar naya MAC, ya secure MAC ka kisi dusre secure port par dikhna.</li>
<li>show port-security interface, show port-security address aur running-config se verify karo.</li>
</ul></div>
`}};export{e as default};