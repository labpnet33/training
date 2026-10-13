var e={id:`mac-radius-static`,h:{en:`MAC RADIUS and static MAC bypass for devices without a supplicant`,hi:`Supplicant ke bina devices ke liye MAC RADIUS aur static MAC bypass`},body:{en:`
<p>Printers, IP cameras, badge readers and many phones cannot run an 802.1X supplicant. If you secure the whole floor with 802.1X, they are locked out. Junos offers two answers that still keep the port closed to strangers: <b>MAC RADIUS</b> and the <b>static MAC bypass</b>. A third answer is the guest VLAN (chapter 6).</p>

<h3>MAC RADIUS</h3>
<p>The switch learns the device's MAC address and sends it to RADIUS as the <b>user name and password</b>, written as 12 hexadecimal digits without separators: the MAC 00:1b:a9:52:00:0c becomes <code>001ba952000c</code>. The RADIUS server has a list of allowed MACs and may return a VLAN. This is also called MAC authentication bypass (MAB) in other products.</p>
<pre class="code"><span class="c">! LABSW: ge-0/0/2 first tries 802.1X; with no EAPOL answer it falls back to MAC RADIUS</span>
set protocols dot1x authenticator interface ge-0/0/2 mac-radius
<span class="c">! MAC RADIUS only, skip the EAPOL wait entirely</span>
set protocols dot1x authenticator interface ge-0/0/2 mac-radius restrict</pre>
<table class="cmp"><tr><th>Statement</th><th>Order on the port</th><th>When to use</th></tr>
<tr><td><code>mac-radius</code></td><td>802.1X first; MAC RADIUS after the EAPOL requests are unanswered</td><td>mixed ports: sometimes a laptop, sometimes a printer</td></tr>
<tr><td><code>mac-radius restrict</code></td><td>MAC RADIUS only, no EAPOL</td><td>ports that only ever have simple devices; faster</td></tr></table>
<p>The wait with plain <code>mac-radius</code> is <code>maximum-requests</code> × <code>transmit-period</code> (default 2 × 30 s = 60 s), because the switch gives the host every chance to answer EAPOL. That is why the printer in the lab needs about a minute.</p>

<h3>Real output: the label printer PRN2</h3>
<pre class="out">lab@LABSW&gt; show dot1x interface ge-0/0/2 detail
ge-0/0/2.0
  Authentication methods:               802.1X, MAC RADIUS
  Mac Radius:                           Enabled
  Mac Radius Restrict:                  Disabled
  Maximum EAPOL requests:               2
  Number of connected supplicants:      1
    Supplicant: 001ba952000c, 00:1b:a9:52:00:0c
      Operational state:                Authenticated
      Authentication method:            Mac Radius
      Authenticated VLAN:               <span class="hl">PRINTERS (assigned by RADIUS)</span>
      802.1X / MAC RADIUS / portal:     <span class="hl">No response / Authenticated / Not run</span></pre>
<p>Read the last line left to right: 802.1X got <b>no response</b>, MAC RADIUS <b>authenticated</b>, the portal did not run. The user name is the MAC. On the server:</p>
<pre class="out">NKRAD2&gt; aaa-server show log
Recent events:
  MAC RADIUS PASS for 001ba952000c (NAS 10.44.50.1, ge-0/0/2)</pre>
<p>This is the answer to "which User-Name did the switch send?": <code>001ba952000c</code>.</p>

<h3>Static MAC bypass</h3>
<p>For a very small number of fixed devices you can skip RADIUS completely and keep the list on the switch:</p>
<pre class="code">set protocols dot1x authenticator static 00:1b:2c:3d:4e:5f vlan-assignment PRINTERS
set protocols dot1x authenticator static 00:1b:2c:3d:4e:5f interface ge-0/0/3</pre>
<p>The switch trusts the list, so there is nothing to check at the server and nothing to break when RADIUS is down. The cost: the list is configuration on every switch and does not scale.</p>

<h3>Security reality check</h3>
<p>MAC addresses are sent in the clear and can be copied. An attacker who learns a printer's MAC can pretend to be it. Reduce the damage: put such devices in a <b>restricted VLAN</b> with access lists that allow only what the device needs, combine with DHCP snooping and dynamic ARP inspection, and log MAC moves. MAC RADIUS controls <i>which device may connect</i>, not <i>who it really is</i>.</p>

<table class="cmp"><tr><th>Method</th><th>Strength</th><th>Scales</th></tr>
<tr><td>802.1X with certificates</td><td>strong</td><td>yes</td></tr>
<tr><td>802.1X with passwords</td><td>medium</td><td>yes</td></tr>
<tr><td>MAC RADIUS</td><td>weak (spoofable)</td><td>yes, central list</td></tr>
<tr><td>Static MAC</td><td>weak</td><td>no</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Registering the MAC with colons or dashes on RADIUS when the switch sends 12 plain hex digits. Impatience: the printer looks dead for about a minute with plain <code>mac-radius</code>. Putting MAC-authenticated devices in the same VLAN as staff.</p></div>
<div class="exam"><p><b>Exam trap.</b> With <code>mac-radius</code> the order is 802.1X, then MAC RADIUS. With <code>restrict</code> the port does only MAC RADIUS. The MAC RADIUS user name <b>and</b> password are both the MAC address.</p></div>

<div class="scn"><h4>The label printer that needed a minute</h4><p>A warehouse enabled 802.1X with MAC RADIUS fallback. Users complained that a new label printer took a minute to come online after every reboot. The cause was the EAPOL wait. Because the port only ever had printers, the team switched it to <code>mac-radius restrict</code> and the delay disappeared.</p><p><b>Lesson:</b> use restrict on ports that never host a supplicant.</p></div>

<div class="iv"><p class="q">"How does MAC RADIUS work and what are its weaknesses?"</p><p>The switch learns the source MAC and sends it as both user name and password to RADIUS, which has a list of allowed devices and may return a VLAN. It gives automated onboarding for devices without a supplicant, but it is spoofable because the MAC is not a secret, so I put such devices in a restricted VLAN with filters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC RADIUS sends the 12-digit MAC as user name and password.</li>
<li><code>mac-radius</code> = 802.1X then MAC; <code>restrict</code> = MAC only.</li>
<li>Default wait before fallback is 2 x 30 seconds.</li>
<li>Static MAC bypass needs no RADIUS but does not scale.</li>
<li>MAC-based methods are spoofable; use restricted VLANs.</li>
</ul></div>
`,hi:`
<p>Printers, IP cameras, badge readers aur kai phones 802.1X supplicant nahi chala sakte. Poora floor 802.1X se secure karoge to woh bahar ho jaate hain. Junos do jawab deta hai jo phir bhi port ko ajnabiyon ke liye band rakhte hain: <b>MAC RADIUS</b> aur <b>static MAC bypass</b>. Teesra jawab guest VLAN hai (chapter 6).</p>

<h3>MAC RADIUS</h3>
<p>Switch device ka MAC address seekhta hai aur use RADIUS ko <b>user name aur password</b> ki tarah bhejta hai, 12 hexadecimal digits bina separators ke: MAC 00:1b:a9:52:00:0c <code>001ba952000c</code> ban jaata hai. RADIUS server ke paas allowed MACs ki list hoti hai aur woh VLAN return kar sakta hai. Doosre products mein ise MAC authentication bypass (MAB) kehte hain.</p>
<pre class="code"><span class="c">! LABSW: ge-0/0/2 pehle 802.1X try karta hai; EAPOL jawab na mile to MAC RADIUS par fallback</span>
set protocols dot1x authenticator interface ge-0/0/2 mac-radius
<span class="c">! sirf MAC RADIUS, EAPOL ka intezaar bilkul nahi</span>
set protocols dot1x authenticator interface ge-0/0/2 mac-radius restrict</pre>
<table class="cmp"><tr><th>Statement</th><th>Port par order</th><th>Kab use karein</th></tr>
<tr><td><code>mac-radius</code></td><td>pehle 802.1X; EAPOL requests unanswered rehne par MAC RADIUS</td><td>mixed ports: kabhi laptop, kabhi printer</td></tr>
<tr><td><code>mac-radius restrict</code></td><td>sirf MAC RADIUS, EAPOL nahi</td><td>jin ports par sirf simple devices aate hain; tez</td></tr></table>
<p>Simple <code>mac-radius</code> mein intezaar <code>maximum-requests</code> × <code>transmit-period</code> hai (default 2 × 30 s = 60 s), kyunki switch host ko EAPOL ka jawab dene ka poora mauka deta hai. Isliye lab ke printer ko kareeb ek minute lagta hai.</p>

<h3>Asli output: label printer PRN2</h3>
<pre class="out">lab@LABSW&gt; show dot1x interface ge-0/0/2 detail
ge-0/0/2.0
  Authentication methods:               802.1X, MAC RADIUS
  Mac Radius:                           Enabled
  Mac Radius Restrict:                  Disabled
  Maximum EAPOL requests:               2
  Number of connected supplicants:      1
    Supplicant: 001ba952000c, 00:1b:a9:52:00:0c
      Operational state:                Authenticated
      Authentication method:            Mac Radius
      Authenticated VLAN:               <span class="hl">PRINTERS (assigned by RADIUS)</span>
      802.1X / MAC RADIUS / portal:     <span class="hl">No response / Authenticated / Not run</span></pre>
<p>Aakhri line baayein se daayein padho: 802.1X ko <b>no response</b>, MAC RADIUS <b>authenticated</b>, portal chala nahi. User name MAC hai. Server par:</p>
<pre class="out">NKRAD2&gt; aaa-server show log
Recent events:
  MAC RADIUS PASS for 001ba952000c (NAS 10.44.50.1, ge-0/0/2)</pre>
<p>Yahi "switch ne kaunsa User-Name bheja?" ka jawab hai: <code>001ba952000c</code>.</p>

<h3>Static MAC bypass</h3>
<p>Bahut kam fixed devices ke liye RADIUS poori tarah chhod sakte ho aur list switch par rakh sakte ho:</p>
<pre class="code">set protocols dot1x authenticator static 00:1b:2c:3d:4e:5f vlan-assignment PRINTERS
set protocols dot1x authenticator static 00:1b:2c:3d:4e:5f interface ge-0/0/3</pre>
<p>Switch apni list par bharosa karta hai, isliye server par kuch check nahi hota aur RADIUS down hone par kuch tootta nahi. Keemat: list har switch ki configuration hai aur scale nahi hoti.</p>

<h3>Security reality check</h3>
<p>MAC addresses clear mein jaate hain aur copy ho sakte hain. Jo attacker printer ka MAC jaan le woh uska bhesh bana sakta hai. Nuksan kam karo: aise devices ko <b>restricted VLAN</b> mein daalo jisme access lists sirf wahi allow karein jo device ko chahiye, DHCP snooping aur dynamic ARP inspection ke saath jodo, aur MAC moves log karo. MAC RADIUS yeh control karta hai ki <i>kaunsa device connect ho sakta hai</i>, yeh nahi ki <i>woh asal mein kaun hai</i>.</p>

<table class="cmp"><tr><th>Method</th><th>Strength</th><th>Scale</th></tr>
<tr><td>Certificates ke saath 802.1X</td><td>strong</td><td>haan</td></tr>
<tr><td>Passwords ke saath 802.1X</td><td>medium</td><td>haan</td></tr>
<tr><td>MAC RADIUS</td><td>weak (spoof ho sakta)</td><td>haan, central list</td></tr>
<tr><td>Static MAC</td><td>weak</td><td>nahi</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> RADIUS par MAC colons ya dashes ke saath register karna jabki switch 12 plain hex digits bhejta hai. Sabr nahi: simple <code>mac-radius</code> mein printer kareeb ek minute mara hua lagta hai. MAC-authenticated devices ko staff wale VLAN mein rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>mac-radius</code> ke saath order 802.1X, phir MAC RADIUS hai. <code>restrict</code> ke saath port sirf MAC RADIUS karta hai. MAC RADIUS ka user name <b>aur</b> password dono MAC address hain.</p></div>

<div class="scn"><h4>Label printer jise ek minute chahiye tha</h4><p>Ek warehouse ne MAC RADIUS fallback ke saath 802.1X enable kiya. Users ne shikayat ki ki naya label printer har reboot ke baad online hone mein ek minute leta hai. Kaaran EAPOL ka intezaar tha. Port par sirf printers hi aate the, isliye team ne use <code>mac-radius restrict</code> par kar diya aur delay khatam.</p><p><b>Lesson:</b> jin ports par supplicant kabhi nahi hota wahan restrict use karo.</p></div>

<div class="iv"><p class="q">"MAC RADIUS kaise kaam karta hai aur uski kamzoriyan kya hain?"</p><p>Switch source MAC seekhta hai aur use user name aur password dono ki tarah RADIUS ko bhejta hai, jiske paas allowed devices ki list hai aur jo VLAN return kar sakta hai. Supplicant ke bina devices ka automated onboarding milta hai, par spoofable hai kyunki MAC secret nahi hota, isliye aise devices ko filters ke saath restricted VLAN mein rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC RADIUS 12-digit MAC ko user name aur password ki tarah bhejta hai.</li>
<li><code>mac-radius</code> = 802.1X phir MAC; <code>restrict</code> = sirf MAC.</li>
<li>Fallback se pehle default intezaar 2 x 30 seconds.</li>
<li>Static MAC bypass ko RADIUS nahi chahiye par scale nahi hota.</li>
<li>MAC-based methods spoofable hain; restricted VLANs use karo.</li>
</ul></div>
`}};export{e as default};