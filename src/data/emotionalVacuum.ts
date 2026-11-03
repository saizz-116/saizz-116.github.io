export const evContent = {
  "workshopContext": "Emotional Vacuum was created in the Alt.Ctrl Workshop at Duke Kunshan University's Innovation Hub, with instruction and project guidance from Xiao Tan, Senior Adjunct Teaching Associate at NYU Shanghai. The workshop combined game design, physical computing, fabrication, and digital development through demonstrations, feedback, and hands-on support.",
  "concept": [
    "Emotional Vacuum begins with a familiar impulse: making an uncomfortable space feel manageable by clearing it. Through shared brainstorming, our team developed a game in which players use a physical vacuum to collect creatures representing negative emotions. Single-emotion encounters first establish a manageable clearing task. In the mixed-emotion phase, each capture adds to an accumulating load: captures take longer, the vacuum's reach contracts, and the room darkens. The action that promises control gradually becomes difficult to sustain.",
    "The transparent backpack places a container for these emotions on the player's own body, connecting virtual collection with physical carrying. This relationship gives the central question a playable form: what happens when removing emotions from our surroundings means continuing to carry them ourselves? The ending opens another possibility. Moonlight draws attention to a window, where a new gesture triggers fireworks. The creatures' eyes return within the bursts, carrying their visual identity into a changed form."
  ],
  "designPrinciples": [
    {
      "title": "Give collection a consequence",
      "text": "Collecting drives the experience forward and gradually changes the conditions of play. Slower captures, a smaller capture range, and fading light connect an otherwise satisfying action to an accumulating cost."
    },
    {
      "title": "Connect the gesture to the idea",
      "text": "A vacuum evokes the familiar act of clearing something away. Wearing its container places the player inside the metaphor; aiming, tilting, carrying, and eventually releasing give the idea a bodily vocabulary."
    },
    {
      "title": "Let emotions retain an identity",
      "text": "The creatures have faces, movement, and distinct visual qualities. The eyes that return in the fireworks suggest continuity through transformation, supporting an ending in which release allows those emotions to take another form."
    }
  ],
  "decisions": [
    {
      "number": "01",
      "title": "Finding a buildable form for emotional weight",
      "problem": "We initially considered increasing the controller's physical weight as emotions accumulated. This placed a demanding hardware task at the center of the experience.",
      "response": "We expressed the growing burden through slower captures, a smaller capture range, and a darkening room, keeping accumulation perceptible within a feasible, integrated design.",
      "contribution": "I helped define the minimum playable scope and developed much of the Unity gameplay and environment, coordinating these choices with teammates' hardware work.",
      "evidence": "The development notes record the change in approach; the game implements load-dependent capture and lighting changes."
    },
    {
      "number": "02",
      "title": "Making deterioration understandable",
      "problem": "Team and classroom playtests revealed that losing responsiveness could look like a software fault. The intended consequence of collecting was difficult to read.",
      "response": "We made the decline gradual. Sparks and malfunction sounds accompany deterioration, giving the eventual loss of suction a visible and audible progression.",
      "contribution": "I gathered and recorded feedback, translated concerns into revisions, and proposed the audiovisual cues while working with teammates across gameplay, art, and sound.",
      "evidence": "Workshop notes document the interpretation problem and the gradual slowdown; the current project contains the malfunction effects and audio."
    },
    {
      "number": "03",
      "title": "Turning a stalled system toward release",
      "problem": "An early version reached a dead end when the vacuum filled. Accumulation needed an ending that gave the player a meaningful action to take.",
      "response": "Darkness gives way to moonlight at the window. Moving toward it introduces a new action: a physical gesture that fills the night sky with fireworks.",
      "contribution": "I proposed the moonlit window ending and developed its visual guidance, incorporating workshop feedback on the release gesture. An on-screen demonstration introduces the new action before players perform it themselves.",
      "evidence": "The demo shows the transition from darkness to the open window and fireworks, with the creatures' eyes returning in the bursts."
    }
  ],
  "timeline": [
    {
      "phase": "01",
      "title": "A shared premise",
      "text": "We formed a four-person team and developed the concept of suppression and accumulation together. The vacuum linked a familiar clearing action to the idea of carrying what had been removed."
    },
    {
      "phase": "02",
      "title": "Connecting body and screen",
      "text": "We built the physical controller and connected it to Unity through OSC. Motion-controlled turning and tilt-based movement established a playable foundation for approaching and collecting the creatures."
    },
    {
      "phase": "03",
      "title": "Learning through playtests",
      "text": "Team and classroom sessions exposed unclear movement rules and a confusing loss of responsiveness. We documented these issues, revised the progression, and proposed stronger spatial and audiovisual guidance."
    },
    {
      "phase": "04",
      "title": "Shaping the complete sequence",
      "text": "We developed the room, creatures, lighting, and sound around collection, overload, and release. The moonlit window and fireworks gave the accumulating system a conclusion."
    },
    {
      "phase": "05",
      "title": "Completing the work",
      "text": "We brought the physical controller, digital room, and release sequence together, recorded the project film, and prepared the work for submission to alt.ctrl.GDC 2027."
    }
  ],
  "collaboration": [
    "Our team developed the central concept together, bringing complementary experience in physical computing, art, music, and game development. I formed the team, scheduled meetings, clarified next steps, and coordinated responsibilities around our strengths and availability. GitHub Desktop helped us share and integrate our work as the physical controller and Unity game developed alongside each other.",
    "Problems often crossed disciplinary boundaries. The vacuum's decline involved gameplay, visual cues, sound, and hardware expectations; its ending brought together my window concept, workshop critique, and the team's implementation work. I kept a record of completed functions, unresolved issues, and proposed solutions so we could decide what to build next. This helped us preserve the intended experience while adjusting scope to practical limits."
  ],
  "credits": [
    {
      "name": "Xueyao Jiang",
      "role": "Project lead and team representative · Game design · Unity development · 3ds Max environment modeling · Hand-drawn posters · Controller design and fabrication"
    },
    {
      "name": "Yue \"Grace\" Chen",
      "role": "Game design · 3D art and Unity development · Music composition and production · Sound design"
    },
    {
      "name": "Yihan Wang",
      "role": "Game design · 3D art · Controller design and art"
    },
    {
      "name": "Jiawen \"Jacklynn\" Ren",
      "role": "Game design · Controller design · Hardware development and integration"
    }
  ],
  "reflection": [
    "This project sharpened my attention to the distance between a functioning mechanic and the experience it communicates. Motion-controlled movement could work while its rules remained unclear. The vacuum could lose responsiveness according to our design while players interpreted that change as a fault. Recording these gaps made iteration more specific.",
    "The completed work leaves me with questions I want to carry into future projects. How can a loss of responsiveness communicate an intentional consequence while preserving the player's trust? How can spatial cues introduce an unfamiliar gesture without spoken instruction? And how does the comfort of a wearable controller shape attention over a full session? These questions now inform how I think about pacing, guidance, and physical interaction."
  ],
  "status": "Completed in October 2026. Created through the Alt.Ctrl Workshop and submitted to alt.ctrl.GDC 2027."
};

