var e={id:`dot1x-config`,h:{en:`Configuring 802.1X with RADIUS and a dynamic VLAN`,hi:`RADIUS aur dynamic VLAN ke saath 802.1X configure karna`},body:{en:`
<p>802.1X on Junos has three configuration pieces: the <b>RADIUS server</b>, an <b>access profile</b> that says "authenticate with RADIUS", and the <b>authenticator ports</b> that use the profile. We use Lab 1, the Pune training floor: switch FLOOR3, RADIUS server NKRAD at 172.20.50.10, desk ports ge-0/0/1 to ge-0/0/3 parked in VLAN LOBBY (90).</p>

<h3>Step 1: the RADIUS server and access profile</h3>
<pre class="code"><span class="c">! shared secret below is a placeholder; use a long random secret in real life</span>
set access radius-server 172.20.50.10 secret "CHANGE-ME-LAB-ONLY"
set access radius-server 172.20.50.10 source-address 172.20.50.1     <span class="c">! optional: fixes the NAS address</span>
set access profile NK-DOT1X authentication-order radius
set access profile NK-DOT1X radius authentication-server 172.20.50.10</pre>
<p>The profile is the glue. <code>authentication-order radius</code> says which method to use (you could add <code>password</code> for local users as a fallback). <code>radius authentication-server</code> must name an address that you defined under <code>access radius-server</code>; a typo here is one of the most common faults (chapter 8).</p>

<h3>Step 2: enable the authenticator on the access ports</h3>
<pre class="code">set protocols dot1x authenticator authentication-profile-name NK-DOT1X
set protocols dot1x authenticator interface ge-0/0/1 supplicant single-secure
set protocols dot1x authenticator interface ge-0/0/2 supplicant single-secure
<span class="c">! optional tuning</span>
set protocols dot1x authenticator interface ge-0/0/1 reauthentication 1800
set protocols dot1x authenticator interface ge-0/0/1 transmit-period 10
set protocols dot1x authenticator interface ge-0/0/1 maximum-requests 2</pre>
<p>The ports are access ports whose <code>vlan members</code> is LOBBY. When RADIUS returns a VLAN, the port is moved to it for this session only. The VLAN (STAFF, VLAN 20) must exist on the switch with a gateway if the user needs routing.</p>

<h3>Real output: after configuration</h3>
<pre class="out">lab@FLOOR3&gt; show dot1x interface
802.1X Information:
Interface     Role           State           MAC address          User
ge-0/0/1.0    Authenticator  Authenticated   00:50:0b:2b:fe:01    riya
ge-0/0/2.0    Authenticator  <span class="hl">Held</span>            00:50:f3:5f:6f:01    kabir
ge-0/0/3.0    Authenticator  Authenticated   00:1b:a9:44:10:07</pre>
<p>Riya is authenticated. Kabir is <b>Held</b>: RADIUS rejected him. The printer on ge-0/0/3 is authenticated without a user name, as we configure the guest VLAN in chapter 6. Now the detail for Riya:</p>
<pre class="out">lab@FLOOR3&gt; show dot1x interface ge-0/0/1 detail
ge-0/0/1.0
  Role:                                 Authenticator
  Supplicant mode:                      Single-Secure
  Authentication methods:               802.1X
  Quiet period:                         60 seconds
  Transmit period:                      30 seconds
  Reauthentication:                     Enabled
  Configured Reauthentication interval: 3600 seconds
  Maximum EAPOL requests:               2
  Guest VLAN member:                    &lt;not configured&gt;
  Server fail action:                   deny
  Authentication profile:               NK-DOT1X
  Number of connected supplicants:      1
    Supplicant: riya, 00:50:0b:2b:fe:01
      Operational state:                Authenticated
      Authentication method:            Radius
      Authenticated VLAN:               <span class="hl">STAFF (assigned by RADIUS)</span>
      802.1X / MAC RADIUS / portal:     Authenticated / Not run / Not run</pre>
<p>Key lines: <b>Authenticated VLAN: STAFF (assigned by RADIUS)</b> proves dynamic VLAN assignment, and the last line tells which methods ran: 802.1X succeeded, MAC RADIUS and portal were not needed.</p>
<pre class="out">lab@FLOOR3&gt; show network-access aaa statistics authentication
Requests received: 3
Accepts: 1
Rejects: 2
Timeouts: 0
RADIUS servers
Server           Requests  Accepts  Rejects  Challenges  Timeouts
172.20.50.10     3         1        2        3           0</pre>
<p>Here the server answers: accepts and rejects, no timeouts. When you see <b>Timeouts</b> grow instead, the problem is between the switch and the server, not with the user.</p>

<h3>Failed users and restarting authentication</h3>
<pre class="out">lab@FLOOR3&gt; show dot1x authentication-failed-users
Total number of failed users: 1
Interface     MAC address          User              Reason
ge-0/0/2.0    00:50:f3:5f:6f:01    kabir             rejected by RADIUS server</pre>
<p>To force a host to log in again after you fix something, use <code>clear dot1x interface ge-0/0/2</code>. A held host otherwise waits for the quiet period (default 60 seconds) before trying again.</p>

<h3>Order of work for a new floor</h3>
<ol>
<li>Create the VLANs, including the dead-end VLAN and the user VLANs, with gateways.</li>
<li>Make RADIUS reachable from the switch (route, firewall, source address) and test with one port.</li>
<li>Define the RADIUS server and profile; commit.</li>
<li>Enable the authenticator on one port; verify; then roll out to the others.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Enabling 802.1X on the port that leads to the RADIUS server or to the uplink. Using <code>supplicant single</code> and thinking it is secure. Forgetting that the VLAN returned by RADIUS must exist on the switch. Putting the real secret in a ticket or chat.</p></div>
<div class="exam"><p><b>Exam trap.</b> The profile is referenced by <code>authentication-profile-name</code> under <code>protocols dot1x authenticator</code>. The RADIUS server itself is under <code>access radius-server</code>. Both must be correct for authentication to work.</p></div>

<div class="scn"><h4>Rollout by one port first</h4><p>A bank branch enabled 802.1X on all 48 ports in one commit. A typo in the profile pointed to the wrong server and every desk was held. The next branch enabled it on one test port with <code>commit confirmed 5</code>, verified RADIUS statistics, and then applied the rest with a group. Zero lockouts.</p><p><b>Lesson:</b> prove the RADIUS path on one port before you secure the floor.</p></div>

<div class="iv"><p class="q">"What do you configure on an EX to enable 802.1X with RADIUS?"</p><p>The RADIUS server with its secret under access radius-server, an access profile with authentication-order radius and the authentication-server, then protocols dot1x authenticator with the profile name and the interfaces with a supplicant mode. Verify with show dot1x interface and the aaa authentication statistics.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three pieces: radius-server, access profile, authenticator ports.</li>
<li>RADIUS can move the port to a VLAN; the detail output says "assigned by RADIUS".</li>
<li>Held means rejected; timeouts in the aaa statistics mean a path or secret problem.</li>
<li>clear dot1x interface restarts authentication on a port.</li>
<li>Prove one port, then roll out.</li>
</ul></div>
`,hi:`
<p>Junos par 802.1X ke teen configuration hisse hain: <b>RADIUS server</b>, ek <b>access profile</b> jo kehta hai "RADIUS se authenticate karo", aur <b>authenticator ports</b> jo profile use karte hain. Hum Lab 1 use karte hain, Pune training floor: switch FLOOR3, RADIUS server NKRAD 172.20.50.10 par, desk ports ge-0/0/1 se ge-0/0/3 VLAN LOBBY (90) mein parked.</p>

<h3>Step 1: RADIUS server aur access profile</h3>
<pre class="code"><span class="c">! neeche ka shared secret placeholder hai; asli mein lamba random secret use karo</span>
set access radius-server 172.20.50.10 secret "CHANGE-ME-LAB-ONLY"
set access radius-server 172.20.50.10 source-address 172.20.50.1     <span class="c">! optional: NAS address fix karta hai</span>
set access profile NK-DOT1X authentication-order radius
set access profile NK-DOT1X radius authentication-server 172.20.50.10</pre>
<p>Profile gond hai. <code>authentication-order radius</code> batata hai kaunsa method use karna hai (local users ke fallback ke liye <code>password</code> bhi jod sakte ho). <code>radius authentication-server</code> mein wahi address hona chahiye jo <code>access radius-server</code> ke neeche define kiya; yahan typo sabse common faults mein se hai (chapter 8).</p>

<h3>Step 2: access ports par authenticator enable karo</h3>
<pre class="code">set protocols dot1x authenticator authentication-profile-name NK-DOT1X
set protocols dot1x authenticator interface ge-0/0/1 supplicant single-secure
set protocols dot1x authenticator interface ge-0/0/2 supplicant single-secure
<span class="c">! optional tuning</span>
set protocols dot1x authenticator interface ge-0/0/1 reauthentication 1800
set protocols dot1x authenticator interface ge-0/0/1 transmit-period 10
set protocols dot1x authenticator interface ge-0/0/1 maximum-requests 2</pre>
<p>Ports access ports hain jinka <code>vlan members</code> LOBBY hai. RADIUS VLAN return kare to port sirf is session ke liye us VLAN mein move hota hai. VLAN (STAFF, VLAN 20) switch par exist karna chahiye, aur user ko routing chahiye to gateway ke saath.</p>

<h3>Asli output: configuration ke baad</h3>
<pre class="out">lab@FLOOR3&gt; show dot1x interface
802.1X Information:
Interface     Role           State           MAC address          User
ge-0/0/1.0    Authenticator  Authenticated   00:50:0b:2b:fe:01    riya
ge-0/0/2.0    Authenticator  <span class="hl">Held</span>            00:50:f3:5f:6f:01    kabir
ge-0/0/3.0    Authenticator  Authenticated   00:1b:a9:44:10:07</pre>
<p>Riya authenticated hai. Kabir <b>Held</b> hai: RADIUS ne reject kiya. ge-0/0/3 ka printer bina user name ke authenticated hai, kyunki chapter 6 mein guest VLAN configure karte hain. Ab Riya ka detail:</p>
<pre class="out">lab@FLOOR3&gt; show dot1x interface ge-0/0/1 detail
ge-0/0/1.0
  Role:                                 Authenticator
  Supplicant mode:                      Single-Secure
  Authentication methods:               802.1X
  Quiet period:                         60 seconds
  Transmit period:                      30 seconds
  Reauthentication:                     Enabled
  Configured Reauthentication interval: 3600 seconds
  Maximum EAPOL requests:               2
  Guest VLAN member:                    &lt;not configured&gt;
  Server fail action:                   deny
  Authentication profile:               NK-DOT1X
  Number of connected supplicants:      1
    Supplicant: riya, 00:50:0b:2b:fe:01
      Operational state:                Authenticated
      Authentication method:            Radius
      Authenticated VLAN:               <span class="hl">STAFF (assigned by RADIUS)</span>
      802.1X / MAC RADIUS / portal:     Authenticated / Not run / Not run</pre>
<p>Key lines: <b>Authenticated VLAN: STAFF (assigned by RADIUS)</b> dynamic VLAN assignment sabit karta hai, aur aakhri line batati hai kaunse methods chale: 802.1X succeed hua, MAC RADIUS aur portal ki zaroorat nahi padi.</p>
<pre class="out">lab@FLOOR3&gt; show network-access aaa statistics authentication
Requests received: 3
Accepts: 1
Rejects: 2
Timeouts: 0
RADIUS servers
Server           Requests  Accepts  Rejects  Challenges  Timeouts
172.20.50.10     3         1        2        3           0</pre>
<p>Yahan server jawab de raha hai: accepts aur rejects, timeouts nahi. Jab <b>Timeouts</b> badhte dikhen, problem switch aur server ke beech hai, user ke saath nahi.</p>

<h3>Failed users aur authentication restart</h3>
<pre class="out">lab@FLOOR3&gt; show dot1x authentication-failed-users
Total number of failed users: 1
Interface     MAC address          User              Reason
ge-0/0/2.0    00:50:f3:5f:6f:01    kabir             rejected by RADIUS server</pre>
<p>Kuch theek karne ke baad host ko dobara login karwane ke liye <code>clear dot1x interface ge-0/0/2</code> use karo. Warna held host dobara try karne se pehle quiet period (default 60 seconds) ruka rehta hai.</p>

<h3>Naye floor ke liye kaam ka order</h3>
<ol>
<li>VLANs banao, dead-end VLAN aur user VLANs gateways ke saath.</li>
<li>Switch se RADIUS reachable banao (route, firewall, source address) aur ek port par test karo.</li>
<li>RADIUS server aur profile define karo; commit.</li>
<li>Ek port par authenticator enable karo; verify; phir baaki par roll out.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> RADIUS server ya uplink ki taraf wale port par 802.1X enable karna. <code>supplicant single</code> ko secure samajhna. Yeh bhoolna ki RADIUS ka diya VLAN switch par exist karna chahiye. Asli secret ticket ya chat mein daalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Profile <code>protocols dot1x authenticator</code> ke neeche <code>authentication-profile-name</code> se refer hota hai. RADIUS server khud <code>access radius-server</code> ke neeche hai. Authentication ke liye dono sahi hone chahiye.</p></div>

<div class="scn"><h4>Pehle ek port se rollout</h4><p>Ek bank branch ne ek hi commit mein saare 48 ports par 802.1X enable kiya. Profile mein typo se galat server point ho gaya aur har desk held ho gaya. Agli branch ne ek test port par <code>commit confirmed 5</code> se enable kiya, RADIUS statistics verify kin, phir group se baaki lagaye. Zero lockouts.</p><p><b>Lesson:</b> floor secure karne se pehle ek port par RADIUS path sabit karo.</p></div>

<div class="iv"><p class="q">"EX par RADIUS ke saath 802.1X enable karne ke liye kya configure karte ho?"</p><p>access radius-server ke neeche secret ke saath RADIUS server, authentication-order radius aur authentication-server wala access profile, phir protocols dot1x authenticator mein profile name aur supplicant mode ke saath interfaces. show dot1x interface aur aaa authentication statistics se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen pieces: radius-server, access profile, authenticator ports.</li>
<li>RADIUS port ko VLAN mein move kar sakta hai; detail output "assigned by RADIUS" kehta hai.</li>
<li>Held matlab rejected; aaa statistics mein timeouts matlab path ya secret problem.</li>
<li>clear dot1x interface port par authentication restart karta hai.</li>
<li>Pehle ek port sabit karo, phir rollout.</li>
</ul></div>
`}};export{e as default};