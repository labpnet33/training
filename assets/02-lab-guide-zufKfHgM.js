var e={id:`ise-ops-lab-guide`,h:{en:`Lab walkthroughs and acceptance checks`,hi:`Lab walkthroughs aur acceptance checks`},body:{en:`<p>These exercises use the same six-device topology. ACCESS is the network access device, ISE is the CONFIG policy server, and STAFF, PRINTER and UNKNOWN represent three endpoint cases. APP is the protected service. Open each lab from this module to practise its specific fault and assessment.</p><h3>Capstone: two independent access faults</h3><p>ACCESS has the wrong RADIUS key and STAFF has the wrong password. Repair both, prove the correct session and keep unknown endpoints denied. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Correct the NAS secret and endpoint credentials.</li><li>Collect session evidence and pass positive and negative tests.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ACCESS:
enable
configure terminal
radius server ISE
key ConfigRadius26
end

STAFF:
dot1x user priya password ConfigLab26

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Revoke a lab identity and terminate access</h3><p>The supplied lab change revokes priya. Remove the lab user, send CoA and prove the endpoint can no longer reach APP. Keep printer MAB working. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Remove the identity from the lab identity store.</li><li>Reevaluate the session and prove access is revoked.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ISE:
aaa-server no user priya
aaa-server coa 10.99.99.1 0050.7966.0201 reauth key ConfigCoA26

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Capstone: correct the returned security group</h3><p>The group policy is installed, but the printer is mistakenly assigned staff SGT 20. Restore SGT 40 without breaking staff access. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Return the intended printer identity group.</li><li>Reauthenticate and prove the group boundary.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ISE:
aaa-server mab 0050.7a00.0404 vlan 40 sgt 40

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show cts role-based sgt-map all</pre></details><h3>Evidence to keep</h3><p>Record the starting failure, the component changed, the resulting identity/method/VLAN/SGT and the traffic outcome. A denied flow must be accompanied by a useful positive test so a disconnected endpoint cannot masquerade as successful isolation. Use only the supplied lab identities. The server helpers and packet model demonstrate concepts; they do not validate a real ISE GUI, certificate chain, posture agent or production deployment.</p>`,hi:`<p>Exercises same six-device topology use karti hain. ACCESS network access device, ISE CONFIG policy server aur STAFF, PRINTER, UNKNOWN teen endpoint cases hain. APP protected service hai. Specific fault aur assessment practice karne ke liye module se har lab kholo.</p><h3>Capstone: do independent access faults</h3><p>ACCESS ki RADIUS key aur STAFF ka password dono wrong hain. Dono repair karo, correct session prove karo aur unknown endpoints denied rakho. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>NAS secret aur endpoint credentials correct karo.</li><li>Session evidence collect karke positive aur negative tests pass karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ACCESS:
enable
configure terminal
radius server ISE
key ConfigRadius26
end

STAFF:
dot1x user priya password ConfigLab26

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Lab identity revoke karke access terminate karo</h3><p>Supplied lab change mein priya revoke hai. Lab user remove karke CoA bhejo aur prove karo endpoint APP reach nahi karta. Printer MAB working rakho. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Lab identity store se identity remove karo.</li><li>Session reevaluate karke access revoke hona prove karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ISE:
aaa-server no user priya
aaa-server coa 10.99.99.1 0050.7966.0201 reauth key ConfigCoA26

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Capstone: returned security group correct karo</h3><p>Group policy installed hai lekin printer ko galti se staff SGT 20 milta hai. Staff access break kiye bina SGT 40 restore karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Intended printer identity group return karo.</li><li>Reauthenticate karke group boundary prove karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ISE:
aaa-server mab 0050.7a00.0404 vlan 40 sgt 40

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show cts role-based sgt-map all</pre></details><h3>Evidence record karo</h3><p>Starting failure, changed component, resulting identity/method/VLAN/SGT aur traffic outcome record karo. Denied flow ke saath useful positive test chahiye taaki disconnected endpoint ko successful isolation na maana jaye. Sirf supplied lab identities use karo. Server helpers aur packet model concepts demonstrate karte hain; real ISE GUI, certificate chain, posture agent ya production deployment validate nahi karte.</p>`}};export{e as default};