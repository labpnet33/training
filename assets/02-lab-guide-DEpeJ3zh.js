var e={id:`ise-mab-lab-guide`,h:{en:`Lab walkthroughs and acceptance checks`,hi:`Lab walkthroughs aur acceptance checks`},body:{en:`<p>These exercises use the same six-device topology. ACCESS is the network access device, ISE is the CONFIG policy server, and STAFF, PRINTER and UNKNOWN represent three endpoint cases. APP is the protected service. Open each lab from this module to practise its specific fault and assessment.</p><h3>Register the printer endpoint</h3><p>PRINTER has no supplicant. Add only MAC 0050.7a00.0404 to the lab MAB policy, returning VLAN 40 and SGT 40. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Register the intended MAC profile.</li><li>Authorize the printer by MAB while retaining staff and unknown behavior.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ISE:
aaa-server mab 0050.7a00.0404 vlan 40 sgt 40

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Ticket: MAB is not enabled on the port</h3><p>ISE knows the printer MAC. Enable MAB on ACCESS g0/2 and use MAB as its method. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Enable the intended port method.</li><li>Verify the printer receives VLAN 40 through MAB.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ACCESS:
enable
configure terminal
interface g0/2
mab
authentication order mab
end

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Limit a non-supplicant guest</h3><p>Allow the non-supplicant on g0/3 into guest VLAN 50 only. Existing routed ACLs block the application subnet; prove both guest gateway access and application denial. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Set the no-response guest VLAN only on g0/3.</li><li>Verify guest reachability and the application boundary.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ACCESS:
enable
configure terminal
interface g0/3
authentication event no-response action authorize vlan 50
end

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Evidence to keep</h3><p>Record the starting failure, the component changed, the resulting identity/method/VLAN/SGT and the traffic outcome. A denied flow must be accompanied by a useful positive test so a disconnected endpoint cannot masquerade as successful isolation. Use only the supplied lab identities. The server helpers and packet model demonstrate concepts; they do not validate a real ISE GUI, certificate chain, posture agent or production deployment.</p>`,hi:`<p>Exercises same six-device topology use karti hain. ACCESS network access device, ISE CONFIG policy server aur STAFF, PRINTER, UNKNOWN teen endpoint cases hain. APP protected service hai. Specific fault aur assessment practice karne ke liye module se har lab kholo.</p><h3>Printer endpoint register karo</h3><p>PRINTER ke paas supplicant nahi. Sirf MAC 0050.7a00.0404 ko lab MAB policy mein add karo, VLAN 40 aur SGT 40 return karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Intended MAC profile register karo.</li><li>Staff aur unknown behavior preserve karke printer ko MAB authorize karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ISE:
aaa-server mab 0050.7a00.0404 vlan 40 sgt 40

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Ticket: port par MAB enabled nahi</h3><p>ISE printer MAC jaanta hai. ACCESS g0/2 par MAB enable karke MAB method use karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Intended port method enable karo.</li><li>Printer ko MAB se VLAN 40 milna verify karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ACCESS:
enable
configure terminal
interface g0/2
mab
authentication order mab
end

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Non-supplicant guest limit karo</h3><p>g0/3 ke non-supplicant ko sirf guest VLAN 50 mein allow karo. Existing routed ACL application subnet block karti hai; guest gateway access aur application denial dono prove karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Sirf g0/3 par no-response guest VLAN set karo.</li><li>Guest reachability aur application boundary verify karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ACCESS:
enable
configure terminal
interface g0/3
authentication event no-response action authorize vlan 50
end

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Evidence record karo</h3><p>Starting failure, changed component, resulting identity/method/VLAN/SGT aur traffic outcome record karo. Denied flow ke saath useful positive test chahiye taaki disconnected endpoint ko successful isolation na maana jaye. Sirf supplied lab identities use karo. Server helpers aur packet model concepts demonstrate karte hain; real ISE GUI, certificate chain, posture agent ya production deployment validate nahi karte.</p>`}};export{e as default};