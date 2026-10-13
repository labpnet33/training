var e={id:`ise-authz-lab-guide`,h:{en:`Lab walkthroughs and acceptance checks`,hi:`Lab walkthroughs aur acceptance checks`},body:{en:`<p>These exercises use the same six-device topology. ACCESS is the network access device, ISE is the CONFIG policy server, and STAFF, PRINTER and UNKNOWN represent three endpoint cases. APP is the protected service. Open each lab from this module to practise its specific fault and assessment.</p><h3>Ticket: authentication succeeds in the wrong VLAN</h3><p>Staff credentials are accepted but the RADIUS VLAN is not applied because network authorization is missing. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Enable network authorization through RADIUS.</li><li>Apply VLAN 20 from RADIUS and restore the data path.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ACCESS:
enable
configure terminal
aaa authorization network default group radius
end

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Ticket: staff receives quarantine authorization</h3><p>The simulated identity check succeeds but priya has VLAN 90 instead of the approved staff VLAN 20. Correct the authorization profile and reauthenticate. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Return the approved staff VLAN and SGT.</li><li>Verify the new session, not just the stored profile.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ISE:
aaa-server authz priya vlan 20 sgt 20

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Enforce a security-group boundary</h3><p>Staff SGT 20 may ping APP (SGT 60). Printer SGT 40 must not reach APP. Create the modeled role-based policy on ACCESS. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Enable enforcement and define both group permissions.</li><li>Prove staff access and printer denial with authorized sessions.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ACCESS:
enable
configure terminal
cts role-based enforcement
cts role-based sgt-map 10.60.60.20 sgt 60
ip access-list role-based STAFF_APP
permit icmp
deny ip
exit
cts role-based permissions from 20 to 60 STAFF_APP
ip access-list role-based PRINTER_DENY
deny ip
exit
cts role-based permissions from 40 to 60 PRINTER_DENY
end

Wait 12 simulated seconds

ACCESS:
show cts role-based permissions
show cts role-based sgt-map all</pre></details><h3>Evidence to keep</h3><p>Record the starting failure, the component changed, the resulting identity/method/VLAN/SGT and the traffic outcome. A denied flow must be accompanied by a useful positive test so a disconnected endpoint cannot masquerade as successful isolation. Use only the supplied lab identities. The server helpers and packet model demonstrate concepts; they do not validate a real ISE GUI, certificate chain, posture agent or production deployment.</p>`,hi:`<p>Exercises same six-device topology use karti hain. ACCESS network access device, ISE CONFIG policy server aur STAFF, PRINTER, UNKNOWN teen endpoint cases hain. APP protected service hai. Specific fault aur assessment practice karne ke liye module se har lab kholo.</p><h3>Ticket: authentication successful, VLAN wrong</h3><p>Staff credentials accepted hain lekin network authorization missing hone se RADIUS VLAN apply nahi hota. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>RADIUS se network authorization enable karo.</li><li>RADIUS se VLAN 20 apply karke data path restore karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ACCESS:
enable
configure terminal
aaa authorization network default group radius
end

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Ticket: staff ko quarantine authorization milti hai</h3><p>Simulated identity check successful hai lekin priya ko approved staff VLAN 20 ki jagah VLAN 90 milti hai. Authorization profile correct karke reauthenticate karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Approved staff VLAN aur SGT return karo.</li><li>Sirf stored profile nahi, new session verify karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ISE:
aaa-server authz priya vlan 20 sgt 20

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Security-group boundary enforce karo</h3><p>Staff SGT 20, APP (SGT 60) ko ping kar sakta hai. Printer SGT 40 APP reach nahi kare. ACCESS par modeled role-based policy banao. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Enforcement enable karke dono group permissions define karo.</li><li>Authorized sessions ke saath staff access aur printer denial prove karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ACCESS:
enable
configure terminal
cts role-based enforcement
cts role-based sgt-map 10.60.60.20 sgt 60
ip access-list role-based STAFF_APP
permit icmp
deny ip
exit
cts role-based permissions from 20 to 60 STAFF_APP
ip access-list role-based PRINTER_DENY
deny ip
exit
cts role-based permissions from 40 to 60 PRINTER_DENY
end

Wait 12 simulated seconds

ACCESS:
show cts role-based permissions
show cts role-based sgt-map all</pre></details><h3>Evidence record karo</h3><p>Starting failure, changed component, resulting identity/method/VLAN/SGT aur traffic outcome record karo. Denied flow ke saath useful positive test chahiye taaki disconnected endpoint ko successful isolation na maana jaye. Sirf supplied lab identities use karo. Server helpers aur packet model concepts demonstrate karte hain; real ISE GUI, certificate chain, posture agent ya production deployment validate nahi karte.</p>`}};export{e as default};