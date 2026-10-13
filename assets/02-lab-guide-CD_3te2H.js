var e={id:`ise-wired-lab-guide`,h:{en:`Lab walkthroughs and acceptance checks`,hi:`Lab walkthroughs aur acceptance checks`},body:{en:`<p>These exercises use the same six-device topology. ACCESS is the network access device, ISE is the CONFIG policy server, and STAFF, PRINTER and UNKNOWN represent three endpoint cases. APP is the protected service. Open each lab from this module to practise its specific fault and assessment.</p><h3>Enable wired 802.1X globally</h3><p>The server and ports are ready. Complete AAA authentication, network authorization and global 802.1X configuration. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Configure the RADIUS server and AAA method lists.</li><li>Authorize staff into VLAN 20 and deny the unknown endpoint.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ACCESS:
enable
configure terminal
aaa new-model
radius server ISE
address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
key ConfigRadius26
aaa authentication dot1x default group radius
aaa authorization network default group radius
dot1x system-auth-control
end

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Connect a staff supplicant</h3><p>STAFF has the correct IP settings but its 802.1X supplicant is off. Enable the lab identity priya / ConfigLab26 and verify the assigned VLAN. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Enable the correct lab supplicant identity.</li><li>Verify 802.1X method, VLAN and application reachability.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">STAFF:
dot1x user priya password ConfigLab26

Wait 12 simulated seconds

ACCESS:
show authentication sessions interface g0/1 details</pre></details><h3>Ticket: Access-Reject for staff</h3><p>The RADIUS client is trusted, but STAFF presents the wrong password. Repair the endpoint identity without weakening authentication. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Present the correct lab credentials.</li><li>Prove successful authentication while unknown endpoints remain blocked.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ISE:
aaa-server show log

STAFF:
dot1x user priya password ConfigLab26

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Evidence to keep</h3><p>Record the starting failure, the component changed, the resulting identity/method/VLAN/SGT and the traffic outcome. A denied flow must be accompanied by a useful positive test so a disconnected endpoint cannot masquerade as successful isolation. Use only the supplied lab identities. The server helpers and packet model demonstrate concepts; they do not validate a real ISE GUI, certificate chain, posture agent or production deployment.</p>`,hi:`<p>Exercises same six-device topology use karti hain. ACCESS network access device, ISE CONFIG policy server aur STAFF, PRINTER, UNKNOWN teen endpoint cases hain. APP protected service hai. Specific fault aur assessment practice karne ke liye module se har lab kholo.</p><h3>Wired 802.1X globally enable karo</h3><p>Server aur ports ready hain. AAA authentication, network authorization aur global 802.1X configuration complete karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>RADIUS server aur AAA method lists configure karo.</li><li>Staff ko VLAN 20 authorize karo aur unknown endpoint deny karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ACCESS:
enable
configure terminal
aaa new-model
radius server ISE
address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
key ConfigRadius26
aaa authentication dot1x default group radius
aaa authorization network default group radius
dot1x system-auth-control
end

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Staff supplicant connect karo</h3><p>STAFF ki IP settings correct hain lekin 802.1X supplicant off hai. Lab identity priya / ConfigLab26 enable karke assigned VLAN verify karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Correct lab supplicant identity enable karo.</li><li>802.1X method, VLAN aur application reachability verify karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">STAFF:
dot1x user priya password ConfigLab26

Wait 12 simulated seconds

ACCESS:
show authentication sessions interface g0/1 details</pre></details><h3>Ticket: staff ko Access-Reject</h3><p>RADIUS client trusted hai lekin STAFF wrong password deta hai. Authentication weak kiye bina endpoint identity repair karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Correct lab credentials present karo.</li><li>Unknown endpoints blocked rakhkar successful authentication prove karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ISE:
aaa-server show log

STAFF:
dot1x user priya password ConfigLab26

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Evidence record karo</h3><p>Starting failure, changed component, resulting identity/method/VLAN/SGT aur traffic outcome record karo. Denied flow ke saath useful positive test chahiye taaki disconnected endpoint ko successful isolation na maana jaye. Sirf supplied lab identities use karo. Server helpers aur packet model concepts demonstrate karte hain; real ISE GUI, certificate chain, posture agent ya production deployment validate nahi karte.</p>`}};export{e as default};