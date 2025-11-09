import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Rewards = () => {
  const rewards = [
    {
      title: "Rover Miles",
      description: "Every time your rover rolls, you earn. Think of it as frequent flyer miles, but muddier."
    },
    {
      title: "Grow & Earn",
      description: "Log your farm or garden data, earn points for every reading. Real dirt, real rewards."
    },
    {
      title: "Solar Saver",
      description: "Run operations during daylight and collect eco-bonus credits. Sun = profit."
    },
    {
      title: "Harvest Cashback",
      description: "Trade data tokens for partner discounts or small produce rebates. Your greens pay for your greens."
    },
    {
      title: "Eden Assist Bonus",
      description: "Let Eden optimize your setup - if her analysis boosts yield, you get loyalty points. She's learning, promise."
    },
    {
      title: "Stake for Free Food",
      description: "(Jk unless donor is feeling generous)"
    }
  ]

  const scrollToSection = (e, sectionId) => {
    e.preventDefault()
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#4A3B30] relative">
        {/* Home Button - Top Right */}
        <div className="absolute top-6 right-6 z-50">
          <Link 
            to="/" 
            onClick={(e) => scrollToSection(e, 'hero')}
            className="hover:opacity-80 transition"
            title="Go to Home"
          >
            <img src="/home_button.png" alt="Home" className="w-10 h-10" />
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          {/* Header with Title and Tomato Icon */}
          <div className="flex items-center gap-4 mb-12">
            <h1 
              className="text-[48px] md:text-[64px] font-black text-[#EFEADF] leading-tight"
              style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 900 }}
            >
              REWARDS PROGRAM
            </h1>
            <img 
              src="/tomato-icon.png" 
              alt="Tomato" 
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
            />
          </div>

          {/* Rewards Grid - 2 rows, 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className="bg-[#EFEADF] rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow"
              >
                <h2 
                  className="text-[24px] md:text-[28px] font-black text-[#2C2C2C] mb-3"
                  style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 900 }}
                >
                  {reward.title}
                </h2>
                <p 
                  className="text-[14px] md:text-[16px] text-[#2C2C2C] leading-relaxed"
                  style={{ fontFamily: 'Inconsolata, monospace' }}
                >
                  {reward.description}
                </p>
              </div>
            ))}
          </div>

          {/* Crypto Section */}
          <div className="mt-16">
            <h2 
              className="text-[36px] md:text-[48px] font-black text-[#EFEADF] mb-8"
              style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 900 }}
            >
              CRYPTO
            </h2>
            <div className="bg-[#EFEADF] rounded-lg p-8 md:p-12 shadow-md">
              <p 
                className="text-[16px] md:text-[18px] text-[#2C2C2C] leading-relaxed mb-6"
                style={{ fontFamily: 'Inconsolata, monospace' }}
              >
                Earn Sator tokens through your agricultural data contributions. Stake your tokens for additional rewards, trade them for partner discounts, or use them to unlock premium Eden AI features.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 
                    className="text-[20px] md:text-[24px] font-black text-[#2C2C2C] mb-3"
                    style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 900 }}
                  >
                    Token Earning
                  </h3>
                  <p 
                    className="text-[14px] md:text-[16px] text-[#2C2C2C] leading-relaxed"
                    style={{ fontFamily: 'Inconsolata, monospace' }}
                  >
                    Every sensor reading, rover mile, and data point you contribute earns Sator tokens. The more you use the platform, the more you earn.
                  </p>
                </div>
                <div>
                  <h3 
                    className="text-[20px] md:text-[24px] font-black text-[#2C2C2C] mb-3"
                    style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 900 }}
                  >
                    Staking & Rewards
                  </h3>
                  <p 
                    className="text-[14px] md:text-[16px] text-[#2C2C2C] leading-relaxed"
                    style={{ fontFamily: 'Inconsolata, monospace' }}
                  >
                    Stake your tokens to earn additional rewards and unlock premium features. Higher stakes = better rewards and priority access to new features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Rewards
